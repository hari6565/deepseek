"use client";

import { useState, useEffect, useRef } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Tooltip } from "./Tooltip";
import { Button } from "./Button";
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { getBorderRadiusClass } from "@/app/utils/branding";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";
import DocumentUploader from './DocumentUploader'
import * as v from 'valibot';

type ContentAlign = 'center' | 'left' | 'right';
type FieldValue = string | number | boolean | null;
type FieldValues = { [key: string]: FieldValue | FieldValues | FieldValues[] };

interface ValidationConfig {
  required?: boolean;
  rule?: 'Past' | 'Future' | 'FutureOrPresent' | 'PastOrPresent';
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

interface FieldMetadata {
  type: "text" | "number" | "boolean" | "date" | "dropdown" | "textarea" | "password" | "documentuploader";
  label: string;
  defaultValue: FieldValue;
  options?: readonly string[] | string;
  text?: string[] | string;
  static?: boolean;
  relation?: boolean;
  saveAs?: string;
  elementId?: string;
  placeholder?: string;
  validation?: ValidationConfig;
  page?: number;
  count?: number;
  height?: number | string;
}

interface ArrayMetadataConfig {
  type: "array";
  label: string;
  items: {
    type: "object";
    fields: MetadataConfig;
  };
}

interface FixedArrayMetadataConfig {
  type: "fixedarray";
  label: string;
  items: Array<{
    type: "object";
    fields: MetadataConfig;
  }>;
}

type MetadataConfig = {
  [key: string]: FieldMetadata | NestedMetadataConfig | ArrayMetadataConfig | FixedArrayMetadataConfig;
};

interface NestedMetadataConfig {
  type: "object";
  label: string;
  fields: MetadataConfig;
}

interface DynamicContentFieldsProps {
  metadata: MetadataConfig;
  onChange: (values: FieldValues) => void;
  onSubmit?: (values: FieldValues) => void;
  onValidationChange?: (isValid: boolean) => void;
  values?: FieldValues; // Add external values prop
  dynamicData?: Record<string, Record<string, any>[]>;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  className?: string;
  contentAlign?: ContentAlign;
  getPaginationData?: (value?: any, page?: number, dfd?: string) => void;
  revalidate?: number;
}

/* -------------------------------------------------------------------------- */
/*  Internal identity helpers                                                 */
/*                                                                            */
/*  Dynamic array items are given a stable `__id` so React reconciles rows by */
/*  identity instead of position. Without it, removing an item shifts every   */
/*  index below it and React re-attaches focus, uncontrolled child state      */
/*  (e.g. DocumentUploader) and the touched/error map to the WRONG row.       */
/*                                                                            */
/*  The id lives inside `values` on purpose: stripping it in onChange would   */
/*  break identity every time the parent pushes controlled `values` back.     */
/*  Use `stripInternalIds` before persisting to a backend if you don't want   */
/*  the field. `onSubmit` already emits a stripped payload.                   */
/* -------------------------------------------------------------------------- */

const genId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const isPlainObject = (val: unknown): val is FieldValues =>
  typeof val === 'object' && val !== null && !Array.isArray(val);

// Recursively ensure every array item that is an object carries a `__id`.
// Existing ids are preserved so identity stays stable across controlled updates.
const ensureIds = (input: FieldValues): FieldValues => {
  const out: FieldValues = {};
  for (const [key, val] of Object.entries(input)) {
    if (Array.isArray(val)) {
      out[key] = val.map((item) => {
        if (isPlainObject(item)) {
          const obj = ensureIds(item);
          if (obj.__id === undefined || obj.__id === null || obj.__id === '') {
            obj.__id = genId();
          }
          return obj;
        }
        return item;
      }) as FieldValues[];
    } else if (isPlainObject(val)) {
      out[key] = ensureIds(val);
    } else {
      out[key] = val;
    }
  }
  return out;
};

// Recursively remove the internal `__id` marker. Use for final payloads.
const stripInternalIds = (input: FieldValues): FieldValues => {
  const out: FieldValues = {};
  for (const [key, val] of Object.entries(input)) {
    if (key === '__id') continue;
    if (Array.isArray(val)) {
      out[key] = val.map((item) =>
        isPlainObject(item) ? stripInternalIds(item) : item
      ) as FieldValues[];
    } else if (isPlainObject(val)) {
      out[key] = stripInternalIds(val);
    } else {
      out[key] = val;
    }
  }
  return out;
};

export default function DynamicContentFields({
  metadata,
  onChange,
  onSubmit,
  onValidationChange,
  values: externalValues,
  dynamicData,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  className = "",
  contentAlign = 'left',
  getPaginationData,
  revalidate,
}: DynamicContentFieldsProps) {
  const { theme, branding } = useGlobal();
  const isDark = theme === "dark" || theme === "dark-hc";
  const [values, setValues] = useState<FieldValues>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
  const [openTableName, setOpenTableName] = useState<string>('');
  const [dropdownPages, setDropdownPages] = useState<Record<string, number>>({});
  const [loadingDropdowns, setLoadingDropdowns] = useState<Set<string>>(new Set());
  const [loadTick, setLoadTick] = useState(0);
  const loadingRef = useRef<Set<string>>(new Set());
  const scrollTopRef = useRef<Record<string, number>>({});
  const listDivRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const loadPreLengthRef = useRef<Record<string, number>>({});
  const noMorePagesRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  // Centralized emitter — keeps the internal `__id` in the live value so
  // controlled round-trips preserve identity. Strip only at submit time.
  const emitChange = (newValues: FieldValues) => {
    onChange(newValues);
  };

  const updateError = (fieldId: string, error: string | null) => {
    setValidationErrors(prev => {
      const next = { ...prev };
      if (error) {
        next[fieldId] = error;
      } else {
        delete next[fieldId];
      }
      onValidationChange?.(Object.keys(next).length === 0);
      return next;
    });
  };

  // Initialize values from metadata and expand all sections by default
  useEffect(() => {
    const initialValues: FieldValues = {};
    const initialExpanded: Record<string, boolean> = {};
  // if (isInitializedRef.current) return;
  // isInitializedRef.current = true;
    Object.entries(metadata).forEach(([key, config]) => {
      if (isFixedArrayMetadata(config)) {
        initialValues[key] = config.items.map((itemConfig) => {
          const item: FieldValues = {};
          Object.entries(itemConfig.fields).forEach(([fieldKey, fieldConfig]) => {
            if (isFieldMetadata(fieldConfig)) {
              item[fieldKey] = fieldConfig.defaultValue ?? null;
            }
          });
          return item;
        });
        initialExpanded[key] = true;
      } else if (isArrayMetadata(config)) {
        const defaultItem: FieldValues = { __id: genId() };
        Object.entries(config.items.fields).forEach(([fieldKey, fieldConfig]) => {
          if (isFieldMetadata(fieldConfig)) {
            defaultItem[fieldKey] = fieldConfig.defaultValue ?? null;
          }
        });
        initialValues[key] = [defaultItem];
        initialExpanded[key] = true;
      } else if (isNestedMetadata(config)) {
        const nestedValues: FieldValues = {};
        Object.entries(config.fields).forEach(([nestedKey, nestedConfig]) => {
          if (isFieldMetadata(nestedConfig)) {
            if(nestedConfig?.type === "dropdown") {
              const initKey = nestedConfig.saveAs ?? nestedKey;
              nestedValues[initKey] = nestedConfig.defaultValue;
            }else
            {
              nestedValues[nestedKey] = nestedConfig.defaultValue ?? null;
            }
          } else if (isFixedArrayMetadata(nestedConfig)) {
            nestedValues[nestedKey] = nestedConfig.items.map((itemConfig) => {
              const item: FieldValues = {};
              Object.entries(itemConfig.fields).forEach(([fieldKey, fieldConfig]) => {
                if (isFieldMetadata(fieldConfig)) {
                  item[fieldKey] = fieldConfig.defaultValue ?? null;
                }
              });
              return item;
            });
            initialExpanded[`${key}.${nestedKey}`] = true;
          } else if (isArrayMetadata(nestedConfig)) {
            const defaultItem: FieldValues = { __id: genId() };
            Object.entries(nestedConfig.items.fields).forEach(([fieldKey, fieldConfig]) => {
              if (isFieldMetadata(fieldConfig)) {
                defaultItem[fieldKey] = fieldConfig.defaultValue ?? null;
              }
            });
            nestedValues[nestedKey] = [defaultItem];
            initialExpanded[`${key}.${nestedKey}`] = true;
          }
        });
        initialValues[key] = nestedValues;
        initialExpanded[key] = true;
      } else if (isFieldMetadata(config)) {
        initialValues[key] = config.defaultValue ?? null;
      }
    });

    setValues(initialValues);
    setExpandedSections(initialExpanded);
    setTouchedFields(new Set());

    // Pre-populate validationErrors for required fields that start empty so
    // onValidationChange stays correct even before the user touches anything.
    const initErrors: Record<string, string> = {};
    const collectInitErrors = (fields: MetadataConfig, prefix?: string) => {
      Object.entries(fields).forEach(([key, config]) => {
        if (isFieldMetadata(config) && config.validation?.required) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          const val = config.defaultValue ?? null;
          if (val === null || val === '' || val === undefined) {
            initErrors[fullKey] = `${config.label} is required`;
          }
        } else if (isNestedMetadata(config)) {
          collectInitErrors(config.fields, key);
        }
        // Array items: required check is deferred until the user interacts
        // (no stable key without an index), but the array itself marks invalid below.
      });
    };
    collectInitErrors(metadata);

    const hasRequiredInArrays = (fields: MetadataConfig): boolean =>
      Object.values(fields).some(config => {
        if (isArrayMetadata(config)) return Object.values(config.items.fields).some(f => isFieldMetadata(f) && !!f.validation?.required);
        if (isFixedArrayMetadata(config)) return config.items.some(item => Object.values(item.fields).some(f => isFieldMetadata(f) && !!f.validation?.required));
        if (isNestedMetadata(config)) return hasRequiredInArrays(config.fields);
        return false;
      });

    setValidationErrors(initErrors);
    const isValid = Object.keys(initErrors).length === 0 && !hasRequiredInArrays(metadata);
    onValidationChange?.(isValid);
  // NOTE: JSON.stringify is intentional. It is a CONTENT-based change guard.
  // The parent may rebuild `metadata` as a fresh object reference every render;
  // depending on `[metadata]` directly would re-run this effect on every render
  // and wipe user input. The stringify cost is O(schema size) and negligible for
  // typical form schemas. If your schema is large or `metadata` is stable, hoist
  // a memoized reference in the parent and switch this dep to `[metadata]`.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(metadata)]);

  // Sync with external values when they change.
  // ensureIds preserves any incoming ids and backfills missing ones so array
  // rows keep stable React keys across controlled updates.
  useEffect(() => {
    if (externalValues) {
      setValues(ensureIds(externalValues));
    }
  }, [externalValues]);

  // When external revalidation triggers, mark all fields with errors as touched
  useEffect(() => {
    if (revalidate && revalidate > 0) {
      setTouchedFields(prev => {
        const next = new Set(prev);
        Object.keys(validationErrors).forEach(key => next.add(key));
        return next;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revalidate]);

  // Detect "no more pages" after each load attempt completes
  useEffect(() => {
    if (!openTableName) return;
    const preLenEntry = loadPreLengthRef.current[openTableName];
    if (preLenEntry === undefined) return;
    const currentLength = Array.isArray(dynamicData?.[openTableName])
      ? (dynamicData![openTableName] as any[]).length : 0;
    if (currentLength === preLenEntry) {
      noMorePagesRef.current.add(openTableName);
    } else {
      noMorePagesRef.current.delete(openTableName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTick, openTableName]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getTextAlignClasses = () => {
    switch (contentAlign) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      case 'center':
        return 'text-center';
      default:
        return 'text-left';
    }
  };

  // Resolve an array position from either a `__id` (dynamic arrays) or a numeric
  // index string (fixed arrays / id-less legacy items).
  const resolveIdx = (arr: FieldValues[], idOrIndex: string): number => {
    const byId = arr.findIndex((it) => isPlainObject(it) && it.__id === idOrIndex);
    if (byId !== -1) return byId;
    const n = Number(idOrIndex);
    return Number.isInteger(n) ? n : -1;
  };

  const updateValue = (key: string, nestedKey: string | null, value: FieldValue) => {
    // Handle nested array item updates (key format: "objectKey.arrayKey__idOrIndex")
    if (key.includes('.') && nestedKey !== null) {
      const dotIndex = key.indexOf('.');
      const objectKey = key.substring(0, dotIndex);
      const rest = key.substring(dotIndex + 1);
      if (rest.includes('__')) {
        const [arrayKey, idStr] = rest.split('__');
        updateNestedArrayValue(objectKey, arrayKey, idStr, nestedKey, value);
        return;
      }
    }

    // Handle array item updates (key format: "arrayKey__idOrIndex")
    if (key.includes('__') && nestedKey !== null) {
      const [arrayKey, idStr] = key.split('__');
      updateArrayValue(arrayKey, idStr, nestedKey, value);
      return;
    }

    setValues((prev) => {
      const newValues = { ...prev };
      if (nestedKey === null) {
        newValues[key] = value;
      } else {
        const nested = newValues[key] as FieldValues;
        newValues[key] = { ...nested, [nestedKey]: value };
      }
      emitChange(newValues);
      return newValues;
    });
  };

  const getArrayDefaultItem = (config: ArrayMetadataConfig): FieldValues => {
    const defaultItem: FieldValues = { __id: genId() };
    Object.entries(config.items.fields).forEach(([fieldKey, fieldConfig]) => {
      if (isFieldMetadata(fieldConfig)) {
        defaultItem[fieldKey] = fieldConfig.defaultValue ?? null;
      }
    });
    return defaultItem;
  };

  const addArrayItem = (key: string, config: ArrayMetadataConfig) => {
    setValues((prev) => {
      const arr = (prev[key] as FieldValues[]) || [];
      const newValues = { ...prev, [key]: [...arr, getArrayDefaultItem(config)] };
      emitChange(newValues);
      return newValues;
    });
  };

  const removeArrayItem = (key: string, index: number) => {
    setValues((prev) => {
      const arr = (prev[key] as FieldValues[]) || [];
      const newArr = arr.filter((_, i) => i !== index);
      const newValues = { ...prev, [key]: newArr };
      emitChange(newValues);
      return newValues;
    });
  };

  const updateArrayValue = (key: string, idOrIndex: string, nestedKey: string, value: FieldValue) => {
    setValues((prev) => {
      const arr = [...((prev[key] as FieldValues[]) || [])];
      const index = resolveIdx(arr, idOrIndex);
      if (index < 0 || index >= arr.length) return prev;
      arr[index] = { ...arr[index], [nestedKey]: value };
      const newValues = { ...prev, [key]: arr };
      emitChange(newValues);
      return newValues;
    });
  };

  const updateNestedArrayValue = (objectKey: string, arrayKey: string, idOrIndex: string, fieldKey: string, value: FieldValue) => {
    setValues((prev) => {
      const objectValues = { ...(prev[objectKey] as FieldValues) };
      const arr = [...((objectValues[arrayKey] as FieldValues[]) || [])];
      const index = resolveIdx(arr, idOrIndex);
      if (index < 0 || index >= arr.length) return prev;
      arr[index] = { ...arr[index], [fieldKey]: value };
      objectValues[arrayKey] = arr;
      const newValues = { ...prev, [objectKey]: objectValues };
      emitChange(newValues);
      return newValues;
    });
  };

  const addNestedArrayItem = (objectKey: string, arrayKey: string, config: ArrayMetadataConfig) => {
    setValues((prev) => {
      const objectValues = { ...(prev[objectKey] as FieldValues) };
      const arr = (objectValues[arrayKey] as FieldValues[]) || [];
      objectValues[arrayKey] = [...arr, getArrayDefaultItem(config)];
      const newValues = { ...prev, [objectKey]: objectValues };
      emitChange(newValues);
      return newValues;
    });
  };

  const removeNestedArrayItem = (objectKey: string, arrayKey: string, index: number) => {
    setValues((prev) => {
      const objectValues = { ...(prev[objectKey] as FieldValues) };
      const arr = (objectValues[arrayKey] as FieldValues[]) || [];
      objectValues[arrayKey] = arr.filter((_, i) => i !== index);
      const newValues = { ...prev, [objectKey]: objectValues };
      emitChange(newValues);
      return newValues;
    });
  };

  const buildNumberSchema = (fieldConfig: FieldMetadata) => {
    const rules = fieldConfig.validation || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let schema: any = v.number();
    // required is handled explicitly in onChange/onBlur (null check before this schema runs)
    if (rules.min !== undefined) {
      schema = v.pipe(schema, v.minValue(rules.min, `Minimum value is ${rules.min}`));
    }
    if (rules.max !== undefined) {
      schema = v.pipe(schema, v.maxValue(rules.max, `Maximum value is ${rules.max}`));
    }
    return schema;
  };

  const buildTextSchema = (fieldConfig: FieldMetadata) => {
    const rules = fieldConfig.validation || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let schema: any = v.string();
    if (rules.required) {
      schema = v.pipe(v.string(), v.minLength(1, `${fieldConfig.label || 'Value'} is required`));
    }
    if (rules.minLength !== undefined) {
      schema = v.pipe(schema, v.minLength(rules.minLength, `Minimum length is ${rules.minLength}`));
    }
    if (rules.maxLength !== undefined) {
      schema = v.pipe(schema, v.maxLength(rules.maxLength, `Maximum length is ${rules.maxLength}`));
    }
    return schema;
  };

  const validateField = (fieldConfig: FieldMetadata, value: FieldValue): string | null => {
    if (!fieldConfig.validation) return null;
    const { required, rule } = fieldConfig.validation;

    if (required && (value === null || value === '' || value === undefined)) {
      return 'This field is required';
    }

    if (rule && fieldConfig.type === 'date' && value && typeof value === 'string') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const date = new Date(value);

      switch (rule) {
        case 'Past': {
          const result = v.safeParse(
            v.pipe(v.string(), v.check(() => date < today, 'Date must be in the past')),
            value
          );
          if (!result.success) return result.issues[0].message;
          break;
        }
        case 'Future': {
          const result = v.safeParse(
            v.pipe(v.string(), v.check(() => date > today, 'Date must be in the future')),
            value
          );
          if (!result.success) return result.issues[0].message;
          break;
        }
        case 'FutureOrPresent': {
          const result = v.safeParse(
            v.pipe(v.string(), v.check(() => date >= today, 'Date must be today or in the future')),
            value
          );
          if (!result.success) return result.issues[0].message;
          break;
        }
        case 'PastOrPresent': {
          const result = v.safeParse(
            v.pipe(v.string(), v.check(() => date <= today, 'Date must be today or in the past')),
            value
          );
          if (!result.success) return result.issues[0].message;
          break;
        }
      }
    }

    return null;
  };

  const renderInput = (
    key: string,
    nestedKey: string | null,
    fieldConfig: FieldMetadata,
    currentValue: FieldValue
  ) => {
    const inputId = nestedKey ? `field-${key}-${nestedKey}` : `field-${key}`;
    const errorKey = nestedKey ? `${key}.${nestedKey}` : key;
    const value = currentValue ?? "";
    const error = validationErrors[errorKey];

    const markTouched = () => setTouchedFields(prev => new Set(prev).add(errorKey));

    const handleChange = (newValue: FieldValue) => {
      markTouched();
      if(fieldConfig?.type =="dropdown") {
        updateValue(key, fieldConfig.saveAs ?? nestedKey, newValue);
        const errorMsg = validateField(fieldConfig, newValue);
        updateError(errorKey, errorMsg);
      }
      else
      {
        updateValue(key, nestedKey, newValue);
        const errorMsg = validateField(fieldConfig, newValue);
        updateError(errorKey, errorMsg);
      }
    };

    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex?.slice(1, 3), 16);
      const g = parseInt(hex?.slice(3, 5), 16);
      const b = parseInt(hex?.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const hasError = touchedFields.has(errorKey) && error;
    const errorBorderColor = '#ef4444';

    const fieldHeight = fieldConfig.height !== undefined
      ? (typeof fieldConfig.height === 'number' ? `${fieldConfig.height}px` : String(fieldConfig.height))
      : '36px';

    const inputClassName = `
      w-full px-3 py-2
      ${getBorderRadiusClass(branding.borderRadius)}
      ${getTextAlignClasses()}
      border-2 transition-all
      ${isDark ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}
      ${hasError ? 'border-red-500' : ''}
      focus:outline-none focus:ring-2
    `.trim();

    const commonHandlers = {
      onMouseEnter: (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (document.activeElement !== e.currentTarget && !hasError) {
          e.currentTarget.style.borderColor = branding.hoverColor;
        }
      },
      onMouseLeave: (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (document.activeElement !== e.currentTarget) {
          e.currentTarget.style.borderColor = hasError ? errorBorderColor : '';
        }
      },
      onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = branding.selectionColor;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${hexToRgba(branding.selectionColor, 0.2)}`;
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = hasError ? errorBorderColor : '';
        e.currentTarget.style.boxShadow = 'none';
        markTouched();
        // Only SET an error on blur — never clear one (clearing is onChange's job).
        const blurVal = e.currentTarget.value;
        const blurErr = fieldConfig.type === 'number'
          ? (blurVal === '' && fieldConfig.validation?.required ? `${fieldConfig.label} is required` : null)
          : validateField(fieldConfig, blurVal as FieldValue);
        if (blurErr) updateError(errorKey, blurErr);
      },
      style: { fontFamily: 'var(--font-body)' }
    };

    let inputElement: React.ReactNode;

    switch (fieldConfig.type) {
      case "textarea":
        inputElement = (
          <textarea
            id={inputId}
            value={String(value)}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldConfig.placeholder || "Value"}
            rows={fieldConfig.height !== undefined ? undefined : 3}
            className={`${inputClassName} resize-y min-h-[60px]`}
            {...commonHandlers}
            style={{ ...commonHandlers.style, ...(fieldConfig.height !== undefined ? { height: fieldHeight } : {}) }}
          />
        );
        break;

      case "number": {
        const numRules = fieldConfig.validation || {};
        const numSchema = buildNumberSchema(fieldConfig);
        inputElement = (
          <input
            id={inputId}
            type="number"
            value={value === null ? "" : String(value)}
            min={numRules.min}
            max={numRules.max}
            required={numRules.required}
            onChange={(e) => {
              markTouched();
              const val = e.target.value;
              const numericValue = val === "" ? null : Number(val);
              updateValue(key, nestedKey, numericValue);
              if (numericValue === null) {
                updateError(errorKey, numRules.required ? `${fieldConfig.label} is required` : null);
              } else {
                const result = v.safeParse(numSchema, numericValue);
                updateError(errorKey, result.success ? null : (result.issues[0]?.message ?? 'Invalid value'));
              }
            }}
            placeholder={fieldConfig.placeholder || "Value"}
            className={inputClassName}
            {...commonHandlers}
            style={{ ...commonHandlers.style, height: fieldHeight }}
          />
        );
        break;
      }

      case "boolean":
        inputElement = (
          <div className="flex items-center" style={{ height: fieldHeight }}>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id={inputId}
                type="checkbox"
                checked={value === true}
                onChange={(e) => handleChange(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-focus:outline-none peer-focus:ring-2"
                style={{
                  backgroundColor: value === true ? branding.selectionColor : isDark ? '#4B5563' : '#D1D5DB',
                  borderColor: isDark ? '#6B7280' : '#E5E7EB',
                }}
              ></div>
              <span className={`ms-2  ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {value === true ? "Yes" : "No"}
              </span>
            </label>
          </div>
        );
        break;

      case "date":
        inputElement = (
          <input
            id={inputId}
            type="date"
            value={String(value)}
            onChange={(e) => handleChange(e.target.value)}
            className={inputClassName}
            {...commonHandlers}
            style={{ ...commonHandlers.style, height: fieldHeight }}
          />
        );
        break;

      case "dropdown": {
        const resolveArr = (ref: string[] | readonly string[] | string | undefined): string[] => {
          if (Array.isArray(ref)) return ref as string[];
          if (typeof ref === 'string') {
            const [tName, fieldName] = ref.split('|');
            const tableData = dynamicData?.[tName];
            return (Array.isArray(tableData) ? tableData : []).map((row) => String(row[fieldName] ?? ''));
          }
          return [];
        };

        const isDynamic = fieldConfig.static === false && typeof fieldConfig.options === 'string';
        const tableName = isDynamic ? (fieldConfig.options as string).split('|')[0] : '';
        const isOpen = openDropdownKey === inputId;
        const isCurrentlyLoading = loadingDropdowns.has(tableName);

        const initialPage = fieldConfig.page ?? 1;
        const pageCount = fieldConfig.count;

        const loadPage = (page: number) => {
          if (!tableName || !page || page < 1 || !pageCount || pageCount < 1) return;
          if (!getPaginationData || loadingRef.current.has(tableName)) return;
          const lenBefore = Array.isArray(dynamicData?.[tableName]) ? (dynamicData![tableName] as any[]).length : 0;
          loadingRef.current.add(tableName);
          setLoadingDropdowns(prev => new Set(prev).add(tableName));
          Promise.resolve(getPaginationData(pageCount, page, tableName)).finally(() => {
            loadingRef.current.delete(tableName);
            setLoadingDropdowns(prev => { const next = new Set(prev); next.delete(tableName); return next; });
            setDropdownPages(prev => ({ ...prev, [tableName]: page }));
            loadPreLengthRef.current[tableName] = lenBefore;
            setLoadTick(t => t + 1);
          });
        };

        const handleOpen = () => {
          if (isOpen) {
            setOpenDropdownKey(null);
            setOpenTableName('');
          } else {
            setOpenDropdownKey(inputId);
            setOpenTableName(tableName);
            noMorePagesRef.current.delete(tableName);
            if (isDynamic && !dropdownPages[tableName] && !loadingRef.current.has(tableName)) {
              loadPage(initialPage);
            }
          }
        };

        const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
          const el = e.currentTarget;
          const prevScrollTop = scrollTopRef.current[inputId] ?? 0;
          const isScrollingDown = el.scrollTop > prevScrollTop;
          scrollTopRef.current[inputId] = el.scrollTop;
          if (isScrollingDown && el.scrollHeight - el.scrollTop <= el.clientHeight + 20 && !loadingRef.current.has(tableName) && !noMorePagesRef.current.has(tableName)) {
            const nextPage = (dropdownPages[tableName] || 1) + 1;
            loadPage(nextPage);
          }
        };

        const handleListWheel = (e: React.WheelEvent<HTMLDivElement>) => {
          if (e.deltaY > 0 && !loadingRef.current.has(tableName) && !noMorePagesRef.current.has(tableName)) {
            const el = e.currentTarget;
            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 20) {
              const nextPage = (dropdownPages[tableName] || 1) + 1;
              loadPage(nextPage);
            }
          }
        };

        const isRelational = fieldConfig.relation;
        if (isDynamic && isRelational) {
          const textArr = resolveArr(fieldConfig.text);
          const optionsArr = resolveArr(fieldConfig.options);
          const storedIndex = textArr.indexOf(String(value));
          const displayValue = storedIndex >= 0 ? optionsArr[storedIndex] : '';
          inputElement = (
            <div
              className="relative"
              tabIndex={-1}
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenDropdownKey(null); }}
            >
              <button
                id={inputId}
                type="button"
                onClick={handleOpen}
                className={`${inputClassName} flex items-center justify-between`}
                style={{ fontFamily: 'var(--font-body)', height: fieldHeight }}
              >
                <span className={displayValue ? '' : (isDark ? 'text-gray-500' : 'text-gray-400')}>
                  {displayValue || 'Select...'}
                </span>
                <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                </svg>
              </button>
              {isOpen && (
                <div
                  ref={(el) => { if (el) listDivRefs.current.set(inputId, el); else listDivRefs.current.delete(inputId); }}
                  className={`absolute z-50 w-full mt-1 max-h-48 overflow-y-scroll border-2 ${getBorderRadiusClass(branding.borderRadius)} shadow-lg ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
                  onScroll={handleListScroll}
                  onWheel={handleListWheel}
                >
                  <div
                    className={`px-3 py-2 cursor-pointer  ${isDark ? 'text-gray-500 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-50'}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { handleChange(''); setOpenDropdownKey(null); }}
                  >
                    Select...
                  </div>
                  {optionsArr.map((option, idx) => (
                    <div
                      key={`${option}-${idx}`}
                      className={`px-3 py-2 cursor-pointer  ${
                        option === displayValue
                          ? isDark ? 'bg-gray-600 text-white' : 'bg-blue-50 text-blue-700'
                          : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-50'
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        handleChange(idx < textArr.length ? textArr[idx] : option);
                        setOpenDropdownKey(null);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                  {isCurrentlyLoading && (
                    <div className={`px-3 py-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Loading...
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        } else if (isRelational) {
          const textArr = resolveArr(fieldConfig.text);
          const optionsArr = resolveArr(fieldConfig.options);
          const storedIndex = textArr.indexOf(String(value));
          const displayValue = storedIndex >= 0 ? optionsArr[storedIndex] : '';
          inputElement = (
            <select
              id={inputId}
              value={displayValue}
              onChange={(e) => {
                const idx = optionsArr.indexOf(e.target.value);
                handleChange(idx >= 0 ? textArr[idx] : e.target.value);
              }}
              className={inputClassName}
              {...commonHandlers}
              style={{ ...commonHandlers.style, height: fieldHeight }}
            >
              <option value="">{fieldConfig.placeholder || 'Select...'}</option>
              {optionsArr.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        } else {
          const plainOptions = Array.isArray(fieldConfig.options) ? fieldConfig.options as string[] : [];
          inputElement = (
            <select
              id={inputId}
              value={String(value)}
              onChange={(e) => handleChange(e.target.value)}
              className={inputClassName}
              {...commonHandlers}
              style={{ ...commonHandlers.style, height: fieldHeight }}
            >
              <option value="">{fieldConfig.placeholder || 'Select...'}</option>
              {plainOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        break;
      }

      case "password":
        inputElement = (
          <input
            id={inputId}
            type="password"
            value={String(value)}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={fieldConfig.placeholder || "Value"}
            className={inputClassName}
            {...commonHandlers}
            style={{ ...commonHandlers.style, height: fieldHeight }}
          />
        );
        break;
        case 'documentuploader': {
        inputElement = (
          <div className="w-full" style={{ height: fieldHeight }}>
            <DocumentUploader
              id={inputId}
              value={value as any}
              onChange={async (files: any) => {
                setTimeout(() => {
                  if (files && files.length > 0) {
                    handleChange(files[0])
                  } else {
                    handleChange('' as any)
                  }
                }, 0)
              }}
              contentAlign={"center"}
              singleSelect={true}
              fillContainer={true}
            />
          </div>
        )
        break;
      }
      default: { // text
        const textRules = fieldConfig.validation || {};
        const textSchema = buildTextSchema(fieldConfig);
        inputElement = (
          <input
            id={inputId}
            type="text"
            value={String(value)}
            minLength={textRules.minLength}
            maxLength={textRules.maxLength}
            required={textRules.required}
            onChange={(e) => {
              markTouched();
              const val = e.target.value;
              updateValue(key, nestedKey, val);
              const result = v.safeParse(textSchema, val);
              updateError(errorKey, result.success ? null : (result.issues[0]?.message ?? 'Invalid value'));
            }}
            placeholder={fieldConfig.placeholder || "Value"}
            className={inputClassName}
            {...commonHandlers}
            style={{ ...commonHandlers.style, height: fieldHeight }}
          />
        );
      }
    }

    return (
      <>
        {inputElement}
        {touchedFields.has(errorKey) && error && (
          <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
            {error}
          </p>
        )}
      </>
    );
  };

  const isNestedMetadata = (config: unknown): config is NestedMetadataConfig => {
    return (
      typeof config === "object" &&
      config !== null &&
      "type" in config &&
      (config as NestedMetadataConfig).type === "object"
    );
  };

  const isFieldMetadata = (config: unknown): config is FieldMetadata => {
    return (
      typeof config === "object" &&
      config !== null &&
      "type" in config &&
      "label" in config &&
      (config as { type: string }).type !== "object" &&
      (config as { type: string }).type !== "array" &&
      (config as { type: string }).type !== "fixedarray"
    );
  };

  const isArrayMetadata = (config: unknown): config is ArrayMetadataConfig => {
    return (
      typeof config === "object" &&
      config !== null &&
      "type" in config &&
      (config as ArrayMetadataConfig).type === "array" &&
      "items" in config
    );
  };

  const isFixedArrayMetadata = (config: unknown): config is FixedArrayMetadataConfig => {
    return (
      typeof config === "object" &&
      config !== null &&
      "type" in config &&
      (config as FixedArrayMetadataConfig).type === "fixedarray" &&
      "items" in config &&
      Array.isArray((config as FixedArrayMetadataConfig).items)
    );
  };

  const handleSubmit = () => {
    if (onSubmit) {
      // Emit a clean payload without the internal `__id` markers.
      onSubmit(stripInternalIds(values));
    }
  };

  const contentElement = (
    <div className="flex flex-col gap-4 w-full h-full">
      {Object.entries(metadata).map(([key, config]) => {
        if (isNestedMetadata(config)) {
          const isExpanded = expandedSections[key] ?? false;
          return (
            <div
              key={key}
              className={`border-2 ${getBorderRadiusClass(branding.borderRadius)} ${
                isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
              } ${className}`}
            >
              {/* Collapsible Header */}
              <button
                onClick={() => toggleSection(key)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  getBorderRadiusClass(branding.borderRadius)
                } ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
                style={{
                  fontFamily: 'var(--font-body)'
                }}
              >
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {config.label}
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  } ${isExpanded ? "transform rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className={`px-4 pb-4 pt-2 border-t ${
                  isDark ? 'border-gray-600' : 'border-gray-100'
                }`}>
                  <div className="flex flex-col gap-4">
                    {/* Simple fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(config.fields).map(([nestedKey, nestedConfig]) => {
                        if (!isFieldMetadata(nestedConfig)) return null;
                        const nestedValues = (values[key] as FieldValues) || {};
                        const readKey = nestedConfig.saveAs ?? nestedKey;
                        const currentValue = (readKey in nestedValues ? nestedValues[readKey] : nestedConfig.defaultValue ?? null) as FieldValue;
                        return (
                          <div key={nestedKey} className="space-y-1.5">
                            <label
                              htmlFor={`field-${key}-${nestedKey}`}
                              className={`block  font-medium ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              {nestedConfig.label}
                              {nestedConfig.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
                            </label>
                            {renderInput(key, nestedKey, nestedConfig, currentValue)}
                          </div>
                        );
                      })}
                    </div>
                    {/* Nested fixed array fields (positional — index keys are safe here) */}
                    {Object.entries(config.fields).map(([nestedKey, nestedConfig]) => {
                      if (!isFixedArrayMetadata(nestedConfig)) return null;
                      const nestedValues = (values[key] as FieldValues) || {};
                      const nestedFixedItems = (nestedValues[nestedKey] as FieldValues[]) || [];
                      const nestedFixedExpanded = expandedSections[`${key}.${nestedKey}`] ?? false;
                      return (
                        <div
                          key={nestedKey}
                          className={`border ${getBorderRadiusClass(branding.borderRadius)} ${
                            isDark ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <button
                            onClick={() => toggleSection(`${key}.${nestedKey}`)}
                            className={`w-full px-4 py-2 flex items-center justify-between text-left transition-colors ${
                              getBorderRadiusClass(branding.borderRadius)
                            }  ${
                              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                              {nestedConfig.label}
                              <span className={`ml-2 text-xs font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                ({nestedFixedItems.length} {nestedFixedItems.length === 1 ? 'item' : 'items'})
                              </span>
                            </span>
                            <svg
                              className={`w-4 h-4 transition-transform ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              } ${nestedFixedExpanded ? "transform rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {nestedFixedExpanded && (
                            <div className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
                              <div className="flex flex-col gap-3">
                                {nestedConfig.items.map((itemConfig, index) => {
                                  const item = nestedFixedItems[index] || {};
                                  return (
                                    <div
                                      key={index}
                                      className={`border ${getBorderRadiusClass(branding.borderRadius)} p-3 ${
                                        isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                                      }`}
                                    >
                                      <div className="mb-2">
                                        <span
                                          className={` font-medium ${
                                            isDark ? 'text-gray-300' : 'text-gray-600'
                                          }`}
                                          style={{ fontFamily: 'var(--font-body)' }}
                                        >
                                          Item {index + 1}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {Object.entries(itemConfig.fields).map(([fieldKey, fieldConfig]) => {
                                          if (!isFieldMetadata(fieldConfig)) return null;
                                          const currentValue = (fieldKey in item ? item[fieldKey] : fieldConfig.defaultValue ?? null) as FieldValue;
                                          return (
                                            <div key={fieldKey} className="space-y-1.5">
                                              <label
                                                htmlFor={`field-${key}.${nestedKey}__${index}-${fieldKey}`}
                                                className={`block  font-medium ${
                                                  isDark ? 'text-gray-300' : 'text-gray-600'
                                                }`}
                                                style={{ fontFamily: 'var(--font-body)' }}
                                              >
                                                {fieldConfig.label}
                                                {fieldConfig.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
                                              </label>
                                              {renderInput(
                                                `${key}.${nestedKey}__${index}`,
                                                fieldKey,
                                                fieldConfig,
                                                currentValue
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {/* Nested array fields (identity-keyed via __id) */}
                    {Object.entries(config.fields).map(([nestedKey, nestedConfig]) => {
                      if (!isArrayMetadata(nestedConfig)) return null;
                      const nestedValues = (values[key] as FieldValues) || {};
                      const nestedArrayItems = (nestedValues[nestedKey] as FieldValues[]) || [];
                      const nestedArrayExpanded = expandedSections[`${key}.${nestedKey}`] ?? false;
                      return (
                        <div
                          key={nestedKey}
                          className={`border ${getBorderRadiusClass(branding.borderRadius)} ${
                            isDark ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <button
                            onClick={() => toggleSection(`${key}.${nestedKey}`)}
                            className={`w-full px-4 py-2 flex items-center justify-between text-left transition-colors ${
                              getBorderRadiusClass(branding.borderRadius)
                            }  ${
                              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                              {nestedConfig.label}
                              <span className={`ml-2 text-xs font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                ({nestedArrayItems.length} {nestedArrayItems.length === 1 ? 'item' : 'items'})
                              </span>
                            </span>
                            <svg
                              className={`w-4 h-4 transition-transform ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              } ${nestedArrayExpanded ? "transform rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {nestedArrayExpanded && (
                            <div className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
                              <div className="flex flex-col gap-3">
                                {nestedArrayItems.map((item, index) => {
                                  const itemId = String((item?.__id as string | undefined) ?? index);
                                  return (
                                  <div
                                    key={itemId}
                                    className={`border ${getBorderRadiusClass(branding.borderRadius)} p-3 ${
                                      isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span
                                        className={` font-medium ${
                                          isDark ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                        style={{ fontFamily: 'var(--font-body)' }}
                                      >
                                        Item {index + 1}
                                      </span>
                                      {nestedArrayItems.length > 1 && (
                                        <button
                                          onClick={() => removeNestedArrayItem(key, nestedKey, index)}
                                          className={`p-1 rounded transition-colors ${
                                            isDark
                                              ? 'text-red-400 hover:bg-red-900/30'
                                              : 'text-red-500 hover:bg-red-50'
                                          }`}
                                          title="Remove item"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {Object.entries(nestedConfig.items.fields).map(([fieldKey, fieldConfig]) => {
                                        if (!isFieldMetadata(fieldConfig)) return null;
                                        const currentValue = (fieldKey in item ? item[fieldKey] : fieldConfig.defaultValue ?? null) as FieldValue;
                                        return (
                                          <div key={fieldKey} className="space-y-1.5">
                                            <label
                                              htmlFor={`field-${key}.${nestedKey}__${itemId}-${fieldKey}`}
                                              className={`block  font-medium ${
                                                isDark ? 'text-gray-300' : 'text-gray-600'
                                              }`}
                                              style={{ fontFamily: 'var(--font-body)' }}
                                            >
                                              {fieldConfig.label}
                                              {fieldConfig.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
                                            </label>
                                            {renderInput(
                                              `${key}.${nestedKey}__${itemId}`,
                                              fieldKey,
                                              fieldConfig,
                                              currentValue
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  );
                                })}
                                <button
                                  onClick={() => addNestedArrayItem(key, nestedKey, nestedConfig)}
                                  className={`w-full py-2 px-4 border-2 border-dashed ${getBorderRadiusClass(branding.borderRadius)} transition-colors ${
                                    ""
                                  } ${
                                    isDark
                                      ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                                      : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
                                  }`}
                                  style={{ fontFamily: 'var(--font-body)' }}
                                >
                                  + Add Item
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        } else if (isFixedArrayMetadata(config)) {
          const isExpanded = expandedSections[key] ?? false;
          const fixedItems = (values[key] as FieldValues[]) || [];
          return (
            <div
              key={key}
              className={`border-2 ${getBorderRadiusClass(branding.borderRadius)} ${
                isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
              } ${className}`}
            >
              <button
                onClick={() => toggleSection(key)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  getBorderRadiusClass(branding.borderRadius)
                }  ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {config.label}
                  <span className={`ml-2 text-xs font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({fixedItems.length} {fixedItems.length === 1 ? 'item' : 'items'})
                  </span>
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  } ${isExpanded ? "transform rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpanded && (
                <div className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
                  <div className="flex flex-col gap-4">
                    {config.items.map((itemConfig, index) => {
                      const item = fixedItems[index] || {};
                      return (
                        <div
                          key={index}
                          className={`border ${getBorderRadiusClass(branding.borderRadius)} p-4 ${
                            isDark ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="mb-3">
                            <span
                              className={` font-medium ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              Item {index + 1}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(itemConfig.fields).map(([fieldKey, fieldConfig]) => {
                              if (!isFieldMetadata(fieldConfig)) return null;
                              const currentValue = (fieldKey in item ? item[fieldKey] : fieldConfig.defaultValue ?? null) as FieldValue;
                              return (
                                <div key={fieldKey} className="space-y-1.5">
                                  <label
                                    htmlFor={`field-${key}__${index}-${fieldKey}`}
                                    className={`block  font-medium ${
                                      isDark ? 'text-gray-300' : 'text-gray-600'
                                    }`}
                                    style={{ fontFamily: 'var(--font-body)' }}
                                  >
                                    {fieldConfig.label}
                                    {fieldConfig.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
                                  </label>
                                  {renderInput(
                                    `${key}__${index}`,
                                    fieldKey,
                                    fieldConfig,
                                    currentValue
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        } else if (isArrayMetadata(config)) {
          const isExpanded = expandedSections[key] ?? false;
          const arrayItems = (values[key] as FieldValues[]) || [];
          return (
            <div
              key={key}
              className={`border-2 ${getBorderRadiusClass(branding.borderRadius)} ${
                isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
              } ${className}`}
            >
              {/* Collapsible Header */}
              <button
                onClick={() => toggleSection(key)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  getBorderRadiusClass(branding.borderRadius)
                }  ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {config.label}
                  <span className={`ml-2 text-xs font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({arrayItems.length} {arrayItems.length === 1 ? 'item' : 'items'})
                  </span>
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  } ${isExpanded ? "transform rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
                  <div className="flex flex-col gap-4">
                    {arrayItems.map((item, index) => {
                      const itemId = String((item?.__id as string | undefined) ?? index);
                      return (
                      <div
                        key={itemId}
                        className={`border ${getBorderRadiusClass(branding.borderRadius)} p-4 ${
                          isDark ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={` font-medium ${
                              isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            Item {index + 1}
                          </span>
                          {arrayItems.length > 1 && (
                            <button
                              onClick={() => removeArrayItem(key, index)}
                              className={`p-1 rounded transition-colors ${
                                isDark
                                  ? 'text-red-400 hover:bg-red-900/30'
                                  : 'text-red-500 hover:bg-red-50'
                              }`}
                              title="Remove item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {Object.entries(config.items.fields).map(([fieldKey, fieldConfig]) => {
                            if (!isFieldMetadata(fieldConfig)) return null;
                            const currentValue = (fieldKey in item ? item[fieldKey] : fieldConfig.defaultValue ?? null) as FieldValue;
                            return (
                              <div key={fieldKey} className="space-y-1.5">
                                <label
                                  htmlFor={`field-${key}__${itemId}-${fieldKey}`}
                                  className={`block  font-medium ${
                                    isDark ? 'text-gray-300' : 'text-gray-600'
                                  }`}
                                  style={{ fontFamily: 'var(--font-body)' }}
                                >
                                  {fieldConfig.label}
                                  {fieldConfig.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
                                </label>
                                {renderInput(
                                  `${key}__${itemId}`,
                                  fieldKey,
                                  fieldConfig,
                                  currentValue
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      );
                    })}

                    {/* Add Item Button */}
                    <button
                      onClick={() => addArrayItem(key, config)}
                      className={`w-full py-2 px-4 border-2 border-dashed ${getBorderRadiusClass(branding.borderRadius)} transition-colors ${
                        ""
                      } ${
                        isDark
                          ? 'border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
                          : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
                      }`}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      + Add Item
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        } else if (isFieldMetadata(config)) {
          // Standalone field (not in a nested object)
          return (
            <div
              key={key}
              className={`border-2 ${getBorderRadiusClass(branding.borderRadius)} p-4 ${
                isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
              } ${className}`}
            >
              <div className="space-y-1.5">
                <label
                  htmlFor={`field-${key}`}
                  className={`block  font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {config.label}
                  {config.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {renderInput(key, null, config, (key in values ? values[key] : config.defaultValue) as FieldValue)}
              </div>
            </div>
          );
        }
        return null;
      })}

      {/* Save Button */}
      {/* <div className="flex justify-end mt-4 w-[59px]">
        <Button
          view="action"
          onClick={handleSubmit}
          className="px-6 py-2"
        >
          Save
        </Button>
      </div>      */}
    </div>
  );

  return <div className="h-full w-full">
 <CommonHeaderAndTooltip
        needTooltip={needTooltip}
        tooltipProps={tooltipProps}
        headerText={headerText}
        headerPosition={headerPosition}
        className={className}
      >
        {contentElement}
      </CommonHeaderAndTooltip>
</div>;
}