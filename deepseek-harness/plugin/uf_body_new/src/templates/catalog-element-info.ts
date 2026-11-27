/**
 * Default `elementInfo` (props / component / events / validation) for EVERY node kind, in one place.
 * 57 kinds: all of the node capability catalog (D:\jsonpreparation\nodes\catalog) except Canvas,
 * whose elementInfo is the empty object and is handled in element-info.templates.ts.
 *
 * Keyed by catalog nodeKey: the nodeType, or for group kinds the nodeGroupType
 * (table, hierarchymapper, subscreen, artifactgroup, grouparray, dynamicactions).
 *
 * source:
 *   'verified' -- the props were copied from a real generated artifact (sample_corect.json) and are kept
 *                 exactly as they were: group, table, button, text, label, textinput, textarea, column.
 *                 Where the catalog differs it differs only in defaults/options (e.g. button "pin" default).
 *   'catalog'  -- the props are the catalog's own array with the catalog-only "_description"
 *                 documentation keys removed; nothing else reshaped. `component` is the catalog's name.
 *
 * hasEvents / hasValidation decide the "#<key>_events" / "#<key>_validation" reference strings
 * (no events => `events: []`). `label` is an extra top-level key only the label control carries.
 */
export interface CatalogElementInfo {
  source: 'verified' | 'catalog'
  component?: string
  label?: string
  props: unknown[]
  hasEvents: boolean
  hasValidation: boolean
}

export const CATALOG_ELEMENT_INFO: Record<string, CatalogElementInfo> = {
  advancesearch: {
    source: 'catalog',
    component: 'AdvanceSearch',
    props: [
      {
        name: 'disabled',
        _label: 'Disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _label: 'Enable Header Text',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  artifactgroup: {
    source: 'catalog',
    props: [],
    hasEvents: false,
    hasValidation: false
  },
  avatar: {
    source: 'catalog',
    component: 'Avatar',
    props: [
      {
        name: 'imageUrl',
        _type: 'resourceSelector',
        value: '/torus/9.1/resources/icons/admin-svgrepo-com.svg',
        enabled: true
      },
      {
        name: 'icon',
        _type: 'iconsearch',
        value: '',
        enabled: true
      },
      {
        name: 'text',
        _type: 'text',
        value: '',
        enabled: true
      },
      {
        name: 'view',
        _type: 'select',
        selectionList: [
          'filled',
          'outlined'
        ],
        value: 'outlined',
        enabled: true
      },
      {
        name: 'theme',
        _type: 'select',
        selectionList: [
          'normal',
          'brand'
        ],
        value: 'normal',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      },
      {
        name: 'enableFooterText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  barchart: {
    source: 'catalog',
    component: 'BarChart',
    props: [
      {
        name: 'enableHeaderText',
        _label: 'Header Text',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _label: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _label: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      },
      {
        name: 'title',
        _label: 'Title',
        _type: 'text',
        value: 'barchart',
        enabled: true
      },
      {
        name: 'showCurrencySign',
        _label: 'Currency Sign',
        _type: 'select',
        selectionList: [
          '₹',
          'د.إ',
          '$',
          '€',
          '£'
        ],
        value: '₹',
        enabled: true
      },
      {
        name: 'colors',
        _label: 'Colors',
        _type: 'array',
        value: [],
        enabled: true,
        items: [
          {
            color: {
              name: 'color',
              _label: 'Color',
              _type: 'color',
              value: '#000000',
              enabled: true
            }
          }
        ]
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  button: {
    source: 'verified',
    component: 'Button',
    props: [
      {
        name: 'view',
        _type: 'select',
        selectionList: [
          'normal',
          'action',
          'outlined',
          'outlined-info',
          'outlined-success',
          'outlined-warning',
          'outlined-danger',
          'outlined-utility',
          'outlined-action',
          'raised',
          'flat',
          'flat-secondary',
          'flat-info',
          'flat-success',
          'flat-warning',
          'flat-danger',
          'flat-utility',
          'flat-action',
          'normal-contrast',
          'outlined-contrast',
          'flat-contrast'
        ],
        value: 'action',
        enabled: true
      },
      {
        name: 'icon',
        _type: 'conditionalIconSearch',
        value: '',
        enabled: true,
        subSelection: {
          iconDisplay: {
            name: 'iconDisplay',
            _type: 'select',
            selectionList: [
              'Icon only',
              'Start with Icon',
              'End with Icon'
            ],
            value: 'End with Icon',
            enabled: true
          }
        }
      },
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'isRecordLevel',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'pin',
        _type: 'select',
        selectionList: [
          'round-round',
          'brick-brick',
          'clear-clear',
          'circle-circle',
          'round-brick',
          'brick-round',
          'round-clear',
          'clear-round',
          'brick-clear',
          'clear-brick',
          'circle-brick',
          'brick-circle',
          'circle-clear',
          'clear-circle'
        ],
        value: 'circle-circle',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      },
      {
        name: 'isValidate',
        _type: 'boolean',
        value: true,
        enabled: true
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  card: {
    source: 'catalog',
    component: 'Card',
    props: [
      {
        name: 'prefixValue',
        _type: 'select',
        selectionList: [
          '$',
          '€',
          '£',
          '₹',
          '¥',
          '¥',
          'A$',
          'C$',
          'CHF',
          'R$',
          '₩',
          'S$',
          'Mex$',
          'د.إ',
          'Rs'
        ],
        value: '₹',
        enabled: true
      },
      {
        name: 'icon',
        _type: 'iconsearch',
        value: '',
        enabled: true
      },
      {
        name: 'theme',
        _type: 'select',
        selectionList: [
          'normal',
          'info',
          'success',
          'warning',
          'danger',
          'utility'
        ],
        value: 'normal',
        enabled: true
      },
      {
        name: 'view',
        _type: 'select',
        selectionList: [
          'outlined',
          'clear',
          'filled',
          'raised'
        ],
        value: 'filled',
        enabled: true
      },
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  checkbox: {
    source: 'catalog',
    component: 'Checkbox',
    props: [
      {
        name: 'content',
        _type: 'text',
        value: 'content',
        enabled: true
      },
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'checked',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  column: {
    source: 'verified',
    component: 'column',
    props: [
      {
        name: 'hide',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'needSearch',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'isSummable',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'ShowAsColorIndicator',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            colorIndicatorViewType: {
              name: 'colorIndicatorViewType',
              _type: 'select',
              selectionList: [
                'rectangle',
                'rounded'
              ],
              value: '',
              enabled: true
            },
            keyValue: {
              name: 'keyValue',
              _label: 'keyValue',
              _type: 'array',
              items: [
                {
                  key: {
                    name: 'key',
                    _label: 'Value',
                    _type: 'text',
                    value: '',
                    enabled: true
                  },
                  colorCode: {
                    name: 'colorCode',
                    _label: 'Color For Value',
                    _type: 'color',
                    value: '',
                    enabled: true
                  },
                  icon: {
                    name: 'icon',
                    _label: 'Icon',
                    _type: 'iconsearch',
                    value: '',
                    enabled: true
                  }
                }
              ]
            }
          }
        }
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  combobox: {
    source: 'catalog',
    component: 'Combobox',
    props: [
      {
        name: 'multiSelect',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'isArray',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'static',
        _type: 'conditionalBoolean',
        value: true,
        subSelection: {
          _true: {
            staticProps: {
              _label: 'Static Options',
              name: 'staticOptions',
              _type: 'array',
              value: false,
              items: [
                {
                  text: {
                    name: 'text',
                    _label: 'Value to Save',
                    _type: 'text',
                    value: 'si',
                    enabled: true
                  },
                  value: {
                    name: 'value',
                    _label: 'Text to Display',
                    _type: 'text',
                    value: 'sivam',
                    enabled: true
                  }
                },
                {
                  text: {
                    name: 'text',
                    _label: 'Value to Save',
                    _type: 'text',
                    value: 'sa',
                    enabled: true
                  },
                  value: {
                    name: 'value',
                    _label: 'Text to Display',
                    _type: 'text',
                    value: 'saran',
                    enabled: true
                  }
                }
              ]
            }
          }
        }
      },
      {
        name: 'selectFirstRecord',
        _label: 'Select First Record by Default',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'dynamic',
        _type: 'boolean',
        value: false,
        dynamicProps: []
      },
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      },
      {
        name: 'hasParent',
        _type: 'boolean',
        value: false,
        enabled: true
      }
    ],
    hasEvents: true,
    hasValidation: true
  },
  customwidget: {
    source: 'catalog',
    component: 'CustomWidget',
    props: [
      {
        name: 'fileName',
        _type: 'text',
        value: 'customwidget',
        enabled: true
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  dateandtime: {
    source: 'catalog',
    component: 'DateAndTime',
    props: [
      {
        name: 'readOnly',
        _label: 'Read Only',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'disabled',
        _label: 'Disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'useCurrentDateAndTime',
        _label: 'Use Current Date And Timeas Default',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _label: 'Header Text',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: true
  },
  datepicker: {
    source: 'catalog',
    component: 'DatePicker',
    props: [
      {
        name: 'readOnly',
        _label: 'Read Only',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'disabled',
        _label: 'Disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'useCurrentDate',
        _label: 'Use Current Date as Default',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _label: 'Header Text',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: true
  },
  divider: {
    source: 'catalog',
    component: 'Divider',
    props: [
      {
        name: 'direction',
        _label: 'Direction',
        _type: 'select',
        selectionList: [
          'horizontal',
          'vertical'
        ],
        value: 'horizontal',
        enabled: true
      },
      {
        name: 'position',
        _label: 'Position',
        _type: 'select',
        selectionList: [
          'start',
          'middle',
          'end'
        ],
        value: 'middle',
        enabled: true
      },
      {
        name: 'thickness',
        _label: 'Thickness',
        _type: 'range',
        value: 2,
        enabled: true,
        minValue: 1,
        maxValue: 50
      },
      {
        name: 'color',
        _label: 'Color',
        _type: 'color',
        value: '#000',
        enabled: true
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  documentuploader: {
    source: 'catalog',
    component: 'Documentuploader',
    props: [
      {
        name: 'viewType',
        _type: 'select',
        selectionList: [
          'modal',
          'onScreen'
        ],
        value: 'modal',
        enabled: true
      },
      {
        name: 'fileNamingPreference',
        _type: 'select',
        selectionList: [
          'use_system_generated_name',
          'keep_original_file_name'
        ],
        value: 'use_system_generated_name',
        enabled: true
      },
      {
        name: 'enableEncryption',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  documentuploadpanel: {
    source: 'catalog',
    component: 'DocumentUploadPanel',
    props: [
      {
        name: 'documentfields',
        _label: 'Document Fields',
        _type: 'array',
        value: '',
        items: [
          {
            name: 'option',
            _label: 'Option',
            _type: 'object',
            enabled: true,
            value: {
              id: {
                name: 'id',
                _label: 'ID',
                _type: 'text',
                value: '',
                enabled: true
              },
              label: {
                name: 'label',
                _label: 'Label',
                _type: 'text',
                value: '',
                enabled: true
              },
              icon: {
                name: 'icon',
                _label: 'Icon',
                _type: 'iconsearch',
                value: '',
                enabled: true
              },
              accept: {
                name: 'accept',
                _label: 'Accept',
                _type: 'multiSelect',
                selectionList: [
                  'image',
                  'pdf',
                  'docx',
                  'xlsx',
                  'csv',
                  'txt',
                  'any'
                ],
                value: [],
                enabled: true
              },
              multiple: {
                name: 'multiple',
                _label: 'Allow Multiple',
                _type: 'boolean',
                value: false,
                enabled: true
              }
            }
          }
        ],
        enabled: true
      },
      {
        name: 'enableEncryption',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      },
      {
        name: 'showTitle',
        _label: 'Show Title',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            title: {
              name: 'title',
              _label: 'Title',
              _type: 'text',
              value: '',
              enabled: true
            },
            subtitle: {
              name: 'subtitle',
              _label: 'Subtitle',
              _type: 'text',
              value: '',
              enabled: true
            }
          },
          _false: {}
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  documentviewer: {
    source: 'catalog',
    component: 'Documentviewer',
    props: [
      {
        name: 'enableEncryption',
        _label: 'Enable Encryption',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'toolbarPosition',
        _label: 'Toolbar Position',
        _type: 'select',
        selectionList: [
          'left',
          'top',
          'right',
          'bottom'
        ],
        value: 'top',
        enabled: true
      },
      {
        name: 'toolbarAlignment',
        _label: 'Toolbar Alignment',
        _type: 'select',
        selectionList: [
          'start',
          'center',
          'end'
        ],
        value: 'center',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  dropdown: {
    source: 'catalog',
    component: 'Dropdown',
    props: [
      {
        name: 'multiSelect',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'isArray',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'static',
        _type: 'conditionalBoolean',
        value: true,
        subSelection: {
          _true: {
            staticProps: {
              _label: 'Static Options',
              name: 'staticOptions',
              _type: 'array',
              value: false,
              items: [
                {
                  text: {
                    name: 'text',
                    _label: 'Value to Save',
                    _type: 'text',
                    value: 'sa',
                    enabled: true
                  },
                  value: {
                    name: 'value',
                    _label: 'Text to Display',
                    _type: 'text',
                    value: 'sivam',
                    enabled: true
                  }
                },
                {
                  text: {
                    name: 'text',
                    _label: 'Value to Save',
                    _type: 'text',
                    value: 'sr',
                    enabled: true
                  },
                  value: {
                    name: 'value',
                    _label: 'Text to Display',
                    _type: 'text',
                    value: 'saran',
                    enabled: true
                  }
                }
              ]
            }
          }
        }
      },
      {
        name: 'selectFirstRecord',
        _label: 'Select First Record by Default',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'dynamic',
        _type: 'boolean',
        value: false,
        dynamicProps: []
      },
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      },
      {
        name: 'hasParent',
        _type: 'boolean',
        value: false,
        enabled: true
      }
    ],
    hasEvents: true,
    hasValidation: true
  },
  dynamicactions: {
    source: 'catalog',
    component: 'DynamicActions',
    props: [
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  dynamicjsonform: {
    source: 'catalog',
    component: 'DynamicJsonForm',
    props: [
      {
        name: 'dynamicJsonForm',
        _label: 'DynamicJsonForm',
        _type: 'array',
        items: [
          {
            key: {
              name: 'key',
              _label: 'Key',
              _type: 'select',
              selectionList: [
                {
                  key: 'all',
                  label: 'All'
                },
                {
                  key: 'loginId',
                  label: 'User Name'
                },
                {
                  key: 'isAppAdmin',
                  label: 'Application Administrator'
                },
                {
                  key: 'client',
                  label: 'Tenant Code'
                },
                {
                  key: 'type',
                  label: 'User Type'
                },
                {
                  key: 'ag',
                  label: 'Application Group'
                },
                {
                  key: 'app',
                  label: 'Application'
                },
                {
                  key: 'userCode',
                  label: 'User Code'
                },
                {
                  key: 'orgGrpCode',
                  label: 'Organization Group Code'
                },
                {
                  key: 'selectedAccessProfile',
                  label: 'Selected Access Profile'
                },
                {
                  key: 'dap',
                  label: 'Data Access Privilege'
                },
                {
                  key: 'orgGrpName',
                  label: 'Organization Group Name'
                },
                {
                  key: 'orgCode',
                  label: 'Organization Code'
                },
                {
                  key: 'orgName',
                  label: 'Organization Name'
                },
                {
                  key: 'subOrgGrpCode',
                  label: 'Sub-Organization Group Code'
                },
                {
                  key: 'subOrgGrpName',
                  label: 'Sub-Organization Group Name'
                },
                {
                  key: 'subOrgCode',
                  label: 'Sub-Organization Code'
                },
                {
                  key: 'subOrgName',
                  label: 'Sub-Organization Name'
                },
                {
                  key: 'psGrpCode',
                  label: 'Product/Service Group Code'
                },
                {
                  key: 'psGrpName',
                  label: 'Product/Service Group Name'
                },
                {
                  key: 'psCode',
                  label: 'Product/Service Code'
                },
                {
                  key: 'psName',
                  label: 'Product/Service Name'
                },
                {
                  key: 'roleGrpCode',
                  label: 'Role Group Code'
                },
                {
                  key: 'roleGrpName',
                  label: 'Role Group Name'
                },
                {
                  key: 'roleCode',
                  label: 'Role Code'
                },
                {
                  key: 'roleName',
                  label: 'Role Name'
                },
                {
                  key: 'sid',
                  label: 'Session ID'
                },
                {
                  key: 'iat',
                  label: 'Login Time'
                },
                {
                  key: 'exp',
                  label: 'Session Expiry Time'
                }
              ],
              value: 'all',
              enabled: true
            },
            value: {
              name: 'value',
              _label: 'Value',
              _type: 'array',
              items: [
                {
                  condition: {
                    name: 'condition',
                    _label: 'Condition',
                    _type: 'text',
                    value: '',
                    enabled: true
                  },
                  schema: {
                    name: 'schema',
                    _label: 'Schema',
                    value: 'CK:CT001:FNGK:AF:FNK:DF-DST:CATK:TGW01:AFGK:TGW002:AFK:basic_dynamijsonform:AFVK:v1:NDP',
                    _type: 'artifactSelector',
                    _payload: {
                      fabric: [
                        'DF-DST'
                      ],
                      subKey: 'NDP'
                    },
                    enabled: true
                  }
                }
              ]
            }
          }
        ],
        value: {},
        enabled: true
      },
      {
        name: 'spreadValue',
        _label: 'Spread Value',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  group: {
    source: 'verified',
    props: [
      {
        name: 'isDynamic',
        _type: 'boolean',
        value: false,
        enabled: true
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  grouparray: {
    source: 'catalog',
    props: [
      {
        name: 'length',
        _type: 'number',
        value: 3,
        enabled: true
      },
      {
        name: 'titleVariant',
        _type: 'select',
        selectionList: [
          'display-4',
          'display-3',
          'display-2',
          'display-1',
          'header-2',
          'header-1',
          'subheader-3',
          'subheader-2',
          'subheader-1',
          'body-3',
          'body-2',
          'body-1',
          'body-short',
          'caption-2',
          'caption-1',
          'code-3',
          'code-inline-3',
          'code-2',
          'code-inline-2',
          'code-1',
          'code-inline-1'
        ],
        value: 'subheader-3',
        enabled: true
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  hierarchymapper: {
    source: 'catalog',
    component: 'HierarchyMapper',
    props: [
      {
        name: 'category',
        _label: 'Category',
        _type: 'text',
        value: '',
        enabled: true
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  hierarchymapperselection: {
    source: 'catalog',
    component: 'HierarchyMapperSelection',
    props: [
      {
        name: 'switchType',
        _label: 'Switch Type',
        _type: 'select',
        selectionList: [
          'toggle',
          'checkbox'
        ],
        value: '',
        enabled: true
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  hierarchymappertext: {
    source: 'catalog',
    component: 'HierarchyMapperText',
    props: [],
    hasEvents: false,
    hasValidation: false
  },
  icon: {
    source: 'catalog',
    component: 'Icon',
    props: [
      {
        name: 'icon',
        _label: 'Icon',
        _type: 'conditionalSelect',
        selectionList: [
          {
            key: 'defaults',
            label: 'Defaults'
          },
          {
            key: 'fromResourceLibrary',
            label: 'From Resource Library'
          }
        ],
        value: 'defaults',
        enabled: true,
        subSelection: {
          defaults: {
            icon: {
              name: 'icon',
              _label: 'Icon',
              _type: 'iconsearch',
              value: 'Md3dRotation',
              enabled: true
            }
          },
          fromResourceLibrary: {
            name: 'imageUrl',
            _label: 'From Resource Library',
            _type: 'resourceSelector',
            value: '',
            enabled: true
          }
        }
      },
      {
        name: 'enableHeaderText',
        _label: 'Header Text',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  image: {
    source: 'catalog',
    component: 'Image',
    props: [
      {
        name: 'URL',
        _type: 'resourceSelector',
        value: '/torus/9.1/CT001/resources/images/ywi6jvge3sra1.gif',
        enabled: true
      },
      {
        name: 'toolbarPosition',
        _label: 'Toolbar Position',
        _type: 'select',
        selectionList: [
          'left',
          'top',
          'right',
          'bottom'
        ],
        value: 'top',
        enabled: true
      },
      {
        name: 'toolbarAlignment',
        _label: 'Toolbar Alignment',
        _type: 'select',
        selectionList: [
          'start',
          'center',
          'end'
        ],
        value: 'center',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  jsoneditor: {
    source: 'catalog',
    component: 'JsonEditor',
    props: [
      {
        name: 'needCompare',
        _label: 'Enable Compare',
        _type: 'boolean',
        value: true,
        enabled: true
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  jsonviewer: {
    source: 'catalog',
    component: 'JsonViewer',
    props: [
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  label: {
    source: 'verified',
    component: 'Label',
    props: [
      {
        name: 'theme',
        _type: 'select',
        selectionList: [
          'normal',
          'info',
          'danger',
          'warning',
          'success',
          'utility',
          'unknown',
          'clear'
        ],
        value: 'normal',
        enabled: true
      },
      {
        name: 'icon',
        _type: 'conditionalIconSearch',
        value: '',
        enabled: true,
        subSelection: {
          iconDisplay: {
            name: 'iconDisplay',
            _type: 'select',
            selectionList: [
              'Icon only',
              'Start with Icon',
              'End with Icon'
            ],
            value: 'End with Icon',
            enabled: true
          }
        }
      },
      {
        name: 'interactive',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'copy',
        _type: 'string',
        value: '',
        enabled: true
      },
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'content',
        _type: 'string',
        value: '',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'string',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: '',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false,
    label: ''
  },
  linechart: {
    source: 'catalog',
    component: 'LineChart',
    props: [
      {
        name: 'enableHeaderText',
        _label: 'Header Text',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _label: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _label: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      },
      {
        name: 'title',
        _label: 'Title',
        _type: 'text',
        value: 'linechart',
        enabled: true
      },
      {
        name: 'showCurrencySign',
        _label: 'Currency Sign',
        _type: 'select',
        selectionList: [
          '₹',
          'د.إ',
          '$',
          '€',
          '£'
        ],
        value: '₹',
        enabled: true
      },
      {
        name: 'colors',
        _label: 'Colors',
        _type: 'array',
        value: [],
        enabled: true,
        items: [
          {
            color: {
              name: 'color',
              _label: 'Color',
              _type: 'color',
              value: '#000000',
              enabled: true
            }
          }
        ]
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  list: {
    source: 'catalog',
    component: 'List',
    props: [
      {
        name: 'sortable',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'filterable',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'selectedItemIndex',
        _type: 'text',
        value: '',
        enabled: true
      },
      {
        name: 'static',
        _type: 'conditionalBoolean',
        value: true,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'items',
              _type: 'array',
              value: '',
              items: [
                {
                  title: 'sivam',
                  disabled: false
                },
                {
                  title: 'amrish',
                  disabled: false
                },
                {
                  title: 'ganapathy',
                  disabled: false
                }
              ],
              enabled: true
            }
          }
        }
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  piechart: {
    source: 'catalog',
    component: 'PieChart',
    props: [
      {
        name: 'enableHeaderText',
        _label: 'Header Text',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _label: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _label: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      },
      {
        name: 'title',
        _label: 'Title',
        _type: 'text',
        value: 'piechart',
        enabled: true
      },
      {
        name: 'showCurrencySign',
        _label: 'Currency Sign',
        _type: 'select',
        selectionList: [
          '₹',
          'د.إ',
          '$',
          '€',
          '£'
        ],
        value: '₹',
        enabled: true
      },
      {
        name: 'colors',
        _label: 'Colors',
        _type: 'array',
        value: [],
        enabled: true,
        items: [
          {
            color: {
              name: 'color',
              _label: 'Color',
              _type: 'color',
              value: '#000000',
              enabled: true
            }
          }
        ]
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  pininput: {
    source: 'catalog',
    component: 'PinInput',
    props: [
      {
        name: 'length',
        _type: 'number',
        value: 4,
        enabled: true
      },
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'placeholder',
        _type: 'text',
        value: '',
        enabled: true
      },
      {
        name: 'mask',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  pivottable: {
    source: 'catalog',
    component: 'PivotTable',
    props: [
      {
        name: 'tableName',
        _type: 'text',
        value: 'mytable',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  progress: {
    source: 'catalog',
    component: 'Progress',
    props: [
      {
        name: 'theme',
        _type: 'select',
        selectionList: [
          'default',
          'success',
          'warning',
          'danger',
          'info',
          'misc'
        ],
        value: 'success',
        enabled: true
      },
      {
        name: 'static',
        _type: 'conditionalBoolean',
        value: true,
        enabled: true,
        subSelection: {
          _true: {
            value: {
              name: 'value',
              _type: 'number',
              value: 60,
              enabled: true
            }
          }
        }
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  progressbar: {
    source: 'catalog',
    component: 'ProgressBar',
    props: [
      {
        name: 'theme',
        _type: 'select',
        selectionList: [
          'default',
          'success',
          'warning',
          'danger',
          'info',
          'misc'
        ],
        value: 'success',
        enabled: true
      },
      {
        name: 'progresstype',
        _type: 'select',
        selectionList: [
          'linear',
          'circular'
        ],
        value: 'linear',
        enabled: true
      },
      {
        name: 'static',
        _type: 'conditionalBoolean',
        value: true,
        enabled: true,
        subSelection: {
          _true: {
            value: {
              name: 'value',
              _type: 'number',
              value: 60,
              enabled: true
            }
          }
        }
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  qrcode: {
    source: 'catalog',
    component: 'QrCode',
    props: [
      {
        name: 'value',
        _label: 'URL',
        _type: 'text',
        value: 'https://www.google.com',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  radio: {
    source: 'catalog',
    component: 'Radio',
    props: [
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'content',
        _type: 'text',
        value: 'Radio',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  radiobutton: {
    source: 'catalog',
    component: 'RadioButton',
    props: [
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'items',
        _type: 'array',
        selectionList: [],
        value: '',
        items: [
          {
            value: 'ss',
            content: 'sivam'
          },
          {
            value: 'sa',
            content: 'saran'
          }
        ],
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  radiogroup: {
    source: 'catalog',
    component: 'RadioGroup',
    props: [
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'direction',
        _type: 'select',
        selectionList: [
          'horizontal',
          'vertical'
        ],
        value: 'vertical',
        enabled: true
      },
      {
        name: 'items',
        _label: 'Options',
        _type: 'arraySelect',
        value: '',
        items: [
          {
            name: 'option',
            _label: 'Option',
            _type: 'object',
            enabled: true,
            value: {
              value: {
                name: 'value',
                _label: 'Value to Save',
                _type: 'text',
                value: 'siv',
                enabled: true
              },
              content: {
                name: 'content',
                _label: 'Content to Display',
                _type: 'text',
                value: 'sivam',
                enabled: true
              }
            }
          }
        ],
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: true
  },
  richtexteditor: {
    source: 'catalog',
    component: 'RichTextEditor',
    props: [
      {
        name: 'enableHeaderText',
        _label: 'Enable Header Text',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  signature: {
    source: 'catalog',
    component: 'Signature',
    props: [
      {
        name: 'title',
        _type: 'text',
        value: '',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  slider: {
    source: 'catalog',
    component: 'Slider',
    props: [
      {
        name: 'showValue',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'validationState',
        _type: 'select',
        value: 'valid',
        enabled: true,
        selectionList: [
          'valid',
          'invalid'
        ]
      },
      {
        name: 'tooltipDisplay',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'min',
        _type: 'text',
        value: '0',
        enabled: true
      },
      {
        name: 'max',
        _type: 'text',
        value: '100',
        enabled: true
      },
      {
        name: 'step',
        _type: 'text',
        value: '10',
        enabled: true
      },
      {
        name: 'marks',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  speech_to_text: {
    source: 'catalog',
    component: 'SpeechToTextInput',
    props: [
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'placeholder',
        _type: 'text',
        value: '',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  subscreen: {
    source: 'catalog',
    props: [],
    hasEvents: true,
    hasValidation: false
  },
  switch: {
    source: 'catalog',
    component: 'Switch',
    props: [
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'content',
        _type: 'text',
        value: 'switchcomp',
        enabled: true
      },
      {
        name: 'enableToggleContent',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            checkedContent: {
              name: 'Checked Content',
              _type: 'text',
              value: '',
              enabled: true
            },
            uncheckedContent: {
              name: 'Unchecked Content',
              _type: 'text',
              value: '',
              enabled: true
            }
          }
        }
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      },
      {
        name: 'defaultvalue',
        _label: 'Default Value',
        _type: 'select',
        selectionList: [
          'true',
          'false'
        ],
        value: '',
        enabled: true
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  tab_group: {
    source: 'catalog',
    component: 'TabGroup',
    props: [
      {
        name: 'headerAlignment',
        _type: 'select',
        selectionList: [
          'left',
          'center',
          'right',
          'full'
        ],
        value: 'left',
        enabled: true
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  tab_header: {
    source: 'catalog',
    component: 'TabHeader',
    props: [],
    hasEvents: true,
    hasValidation: false
  },
  table: {
    source: 'verified',
    component: 'Table',
    props: [
      {
        name: 'tableName',
        _type: 'text',
        value: '',
        enabled: true
      },
      {
        name: 'primaryKey',
        _type: 'text',
        value: 'id',
        enabled: true
      },
      {
        name: 'parentTableName',
        _type: 'text',
        value: '',
        enabled: true
      },
      {
        name: 'parentTablePrimaryKey',
        _label: 'Parent Table Column Name',
        _type: 'text',
        value: '',
        enabled: true
      },
      {
        name: 'tableSettings',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'tableSorting',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'tableSelection',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'search',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'tableActions',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'needLocking',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'isPivotTable',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  text: {
    source: 'verified',
    component: 'Text',
    props: [
      {
        name: 'static',
        _type: 'conditionalBoolean',
        value: true,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'content',
              _type: 'text',
              value: '',
              enabled: true
            }
          }
        }
      },
      {
        name: 'variant',
        _type: 'select',
        selectionList: [
          'display-4',
          'display-3',
          'display-2',
          'display-1',
          'header-2',
          'header-1',
          'subheader-3',
          'subheader-2',
          'subheader-1',
          'body-3',
          'body-2',
          'body-1',
          'body-short',
          'caption-2',
          'caption-1',
          'code-3',
          'code-inline-3',
          'code-2',
          'code-inline-2',
          'code-1',
          'code-inline-1'
        ],
        value: 'display-3',
        enabled: true
      },
      {
        name: 'wordBreak',
        _type: 'select',
        selectionList: [
          'break-all',
          'break-word'
        ],
        value: '',
        enabled: true
      },
      {
        name: 'color',
        _type: 'select',
        selectionList: [
          'primary',
          'complementary',
          'secondary',
          'hint',
          'info',
          'info-heavy',
          'positive',
          'positive-heavy',
          'warning',
          'warning-heavy',
          'danger',
          'danger-heavy',
          'utility',
          'utility-heavy',
          'misc',
          'misc-heavy',
          'brand',
          'link',
          'link-hover',
          'link-visited',
          'link-visited-hover',
          'dark-primary',
          'dark-complementary',
          'dark-secondary',
          'light-primary',
          'light-complementary',
          'light-secondary',
          'light-hint',
          'inverted-primary',
          'inverted-complementary',
          'inverted-secondary',
          'inverted-hint'
        ],
        value: 'primary',
        enabled: true
      },
      {
        name: 'icon',
        _type: 'conditionalIconSearch',
        value: '',
        enabled: true,
        subSelection: {
          iconDisplay: {
            name: 'iconDisplay',
            _type: 'select',
            selectionList: [
              'Icon only',
              'Start with Icon',
              'End with Icon'
            ],
            value: 'End with Icon',
            enabled: true
          },
          iconSize: {
            name: 'Icon Size',
            _type: 'number',
            value: 22,
            enabled: true
          }
        }
      }
    ],
    hasEvents: false,
    hasValidation: false
  },
  text_to_speech: {
    source: 'catalog',
    component: 'TextToSpeechOutput',
    props: [
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'placeholder',
        _type: 'text',
        value: '',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  textarea: {
    source: 'verified',
    component: 'TextArea',
    props: [
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'readOnly',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'pin',
        _type: 'select',
        selectionList: [
          'round-round',
          'brick-brick',
          'clear-clear',
          'round-brick',
          'brick-round',
          'round-clear',
          'clear-round',
          'brick-clear',
          'clear-brick'
        ],
        value: 'brick-brick',
        enabled: true
      },
      {
        name: 'placeholder',
        _type: 'text',
        value: 'type here...',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: true
  },
  textinput: {
    source: 'verified',
    component: 'TextInput',
    props: [
      {
        name: 'disabled',
        _label: 'Disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'readOnly',
        _label: 'Read Only',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'pin',
        _label: 'Pin',
        _type: 'select',
        selectionList: [
          'round-round',
          'brick-brick',
          'clear-clear'
        ],
        value: 'brick-brick',
        enabled: true
      },
      {
        name: 'view',
        _label: 'View',
        _type: 'select',
        selectionList: [
          'normal',
          'clear'
        ],
        value: 'normal',
        enabled: true
      },
      {
        name: 'placeholder',
        _label: 'Placeholder',
        _type: 'text',
        value: 'type here....',
        enabled: true
      },
      {
        name: 'leftContent',
        _label: 'Left Content',
        _type: 'text',
        value: '',
        enabled: true
      },
      {
        name: 'rightContent',
        _label: 'Right Content',
        _type: 'text',
        value: '',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _label: 'Enable Header Text',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      },
      {
        name: 'numberFormat',
        _label: 'Number Format Style',
        _type: 'select',
        selectionList: [
          'none',
          'Indian',
          'International',
          'European'
        ],
        value: '',
        enabled: false
      },
      {
        name: 'isCurrency',
        _label: 'Is Currency',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'bindInitialData',
        _label: 'Bind Initial Data',
        _type: 'boolean',
        value: false,
        enabled: true
      }
    ],
    hasEvents: true,
    hasValidation: true
  },
  timeline: {
    source: 'catalog',
    component: 'TimeLine',
    props: [
      {
        name: 'view',
        _type: 'select',
        selectionList: [
          'horizontal',
          'vertical'
        ],
        value: 'vertical',
        enabled: true
      },
      {
        name: 'Title',
        _label: 'Title Field Name',
        _type: 'text',
        value: 'name',
        enabled: true
      },
      {
        name: 'Status',
        _label: 'Status Field Name',
        _type: 'text',
        value: 'trs_event_status',
        enabled: true
      },
      {
        name: 'Date',
        _label: 'Date Field Name',
        _type: 'text',
        value: 'trs_created_date',
        enabled: true
      },
      {
        name: 'FilterBy',
        _label: 'Filter By Field Name',
        _type: 'text',
        value: 'id',
        enabled: true
      },
      {
        keyValue: {
          name: 'keyValue',
          _label: 'keyValue',
          _type: 'array',
          items: [
            {
              statusValue: {
                name: 'statusValue',
                _label: 'Status Value',
                _type: 'text',
                value: 'sucess',
                enabled: true
              },
              colorCode: {
                name: 'colorCode',
                _label: 'Color Code',
                _type: 'color',
                value: '#6ddf95',
                enabled: true
              },
              icon: {
                name: 'icon',
                _label: 'Icon',
                _type: 'iconsearch',
                value: '',
                enabled: true
              }
            },
            {
              statusValue: {
                name: 'statusValue',
                _label: 'Status Value',
                _type: 'text',
                value: 'pending',
                enabled: true
              },
              colorCode: {
                name: 'colorCode',
                _label: 'Color Code',
                _type: 'color',
                value: '#e0e77e',
                enabled: true
              },
              icon: {
                name: 'icon',
                _label: 'Icon',
                _type: 'iconsearch',
                value: '',
                enabled: true
              }
            },
            {
              statusValue: {
                name: 'statusValue',
                _label: 'Status Value',
                _type: 'text',
                value: 'failure',
                enabled: true
              },
              colorCode: {
                name: 'colorCode',
                _label: 'Color Code',
                _type: 'color',
                value: '#d65c5c',
                enabled: true
              },
              icon: {
                name: 'icon',
                _label: 'Icon',
                _type: 'iconsearch',
                value: '',
                enabled: true
              }
            }
          ]
        }
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      },
      {
        name: 'initialLoad',
        _label: 'Initial Load',
        _type: 'boolean',
        value: true,
        enabled: true
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  timepicker: {
    source: 'catalog',
    component: 'TimePicker',
    props: [
      {
        name: 'disabled',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'readOnly',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'timeType',
        _type: 'select',
        selectionList: [
          'normal',
          'railway'
        ],
        value: 'normal',
        enabled: true
      },
      {
        name: 'settings',
        _type: 'select',
        selectionList: [
          'HH:mm:ss',
          'HH:mm'
        ],
        value: 'HH:mm',
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  treeviewer: {
    source: 'catalog',
    component: 'TreeViewer',
    props: [
      {
        name: 'view',
        _type: 'select',
        selectionList: [
          'expanded',
          'collapsed'
        ],
        value: 'expanded',
        enabled: true
      },
      {
        name: 'isEditable',
        _type: 'boolean',
        value: false,
        enabled: true
      },
      {
        name: 'enableHeaderText',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: true,
    hasValidation: false
  },
  xmlviewer: {
    source: 'catalog',
    component: 'XmlViewer',
    props: [
      {
        name: 'enableHeaderText',
        _label: 'Enable Header Text',
        _type: 'conditionalBoolean',
        value: false,
        enabled: true,
        subSelection: {
          _true: {
            content: {
              name: 'Header Text',
              _type: 'text',
              value: '',
              enabled: true
            },
            position: {
              name: 'Header Position',
              _type: 'select',
              selectionList: [
                'left',
                'top',
                'right',
                'bottom'
              ],
              value: 'top',
              enabled: true
            }
          }
        }
      }
    ],
    hasEvents: false,
    hasValidation: false
  }
}
