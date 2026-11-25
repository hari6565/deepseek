'use client'
import * as XLSX from '@e965/xlsx'
import { useEffect, useState } from 'react'
import * as React from 'react'
import { DropzoneOptions, useDropzone } from 'react-dropzone'
import {
  BsFiletypeJpg,
  BsFiletypeJson,
  BsFiletypePng,
  BsImage
} from 'react-icons/bs'
import { RiDeleteBinLine } from 'react-icons/ri'
import { BiHide } from 'react-icons/bi'
import {
  FaArrowCircleDown,
  FaCss3Alt,
  FaFileAlt,
  FaFileArchive,
  FaFileCode,
  FaFileCsv,
  FaFileExcel,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
  FaHtml5,
  FaMarkdown,
  FaSass
} from 'react-icons/fa'
import { IoLogoJavascript } from 'react-icons/io'
import { IoCloseCircleOutline } from 'react-icons/io5'
import { MdFileUpload, MdOutlineCloudDownload } from 'react-icons/md'
import { SiReact, SiTypescript } from 'react-icons/si'
import { TbFileUpload } from 'react-icons/tb'
import DocViewer from "@/components/DocumentViewer";
import axios from 'axios'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Icon } from '@/components/Icon'
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global"
import { useGlobal } from '@/context/GlobalContext'
import { getBorderRadiusClass } from '@/app/utils/branding'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'
import Image from "next/image";

type ContentAlign = "left" | "center" | "right";

type InputProps = {
  className?: string
  value?: FilesType[]
  onChange?: React.Dispatch<React.SetStateAction<FilesType[]>>
  disabled?: boolean
  dropzoneOptions?: Omit<DropzoneOptions, 'disabled'>
  preview?: boolean
  draggable?: boolean
  id: string
  singleSelect?: boolean
  headerText?: string
  headerPosition?: HeaderPosition
  tooltipProps?: TooltipPropsType
  needTooltip?: boolean
  fillContainer?: boolean;
  contentAlign?: ContentAlign;
}

interface FilesType {
  file: File
  url: string
}

type Drag_file = FilesType[]

const DocumentUploader = ({
  dropzoneOptions,
  value = [],
  className,
  disabled,
  onChange,
  preview = true,
  draggable = false,
  id,
  singleSelect = true,
  viewType="modal",
  DbType,
  enableEncryption,
  fileNamingPreference="use_system_generated_name",
  headerText,
  headerPosition = "top",
  tooltipProps,
  needTooltip = false,
  fillContainer = true,
  contentAlign = "center"
}: any) => {
  const [files, setFiles] = React.useState<Drag_file>(Array.isArray(value) ? value : [])
  const [open, setOpen] = React.useState(false)
  const [previewModel, setPreviewModel] = React.useState(false)
  const [currentFile, setCurrentFile] = React.useState<FilesType | null>(null);
  const { theme, direction,branding } = useGlobal();

  async function convertUrlToFile(url: string) {
    try {
      const response = await axios.get(url, { responseType: "blob" });
  
      const fileType = response.data.type || "application/octet-stream";
      const fileName = url.split("/").pop() || "downloaded-file";
  
      const file = new File([response.data], fileName, { type: fileType });
      const fileUrl = URL.createObjectURL(file);
  
      return { file, url: fileUrl };
    } catch (error) {
      console.error("Error fetching file:", error);
      return null;
    }
  }

  function isValidUrl(str: string): boolean {
    try {
      const url = new URL(str)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  React.useEffect(() => {
    if (Array.isArray(value)) {  // for refresh selected documents when this component inside a groupArray
      setFiles(prev => {
        const isSame =
          prev.length === value.length &&
          prev.every((f: any, i: number) => f.file === value[i]?.file)
        return isSame ? prev : value
      })
    } else if (value === '' || value === null || value === undefined) {
      setFiles(prev => (prev.length === 0 ? prev : []))
    } else if (typeof value === 'string') {
      // Only fetch if it's a valid URL, otherwise it's likely a file ID from backend
      if (isValidUrl(value)) {
        convertUrlToFile(value).then(result => {
          if (result) {
            setFiles([result])
          }
        })
      }
      // If it's a file ID (not a URL), don't try to fetch - the file was already uploaded
    }
  }, [value])

  const handleDrop = (acceptedFiles: File[]) => {

    if (!acceptedFiles.length) {

      return
    }
    setFiles((prevFiles: any) => {
      const existingFileNames = new Set(
        prevFiles.map((file: any) =>
          file instanceof File ? `${file.name}-${file.size}` : file
        )
      )
      const newFiles = acceptedFiles.filter(file => {
        const uniqueKey = `${file.name}-${file.size}`
        return !existingFileNames.has(uniqueKey)
      })
 
      if (newFiles.length === 0) return prevFiles

      const filesWithUrls: FilesType[] = newFiles.map(file => {
        const ext = file.name.split('.').pop() || '';
        const baseName = file.name.replace(`.${ext}`, '');
        const uniqueName = `${baseName}${fileNamingPreference=="use_system_generated_name"?"_"+Date.now():""}.${ext}`; // name_time format

        const renamedFile = new File([file], uniqueName, { type: file.type });
        Object.defineProperty(renamedFile, 'DbType', {
          value: DbType,
          writable: true,
          enumerable: true
        })
        Object.defineProperty(renamedFile, 'returnType', {
          value: singleSelect ? 'string' : 'string[]',
          writable: true,
          enumerable: true
        })
        Object.defineProperty(renamedFile, 'enableEncryption', {
          value: enableEncryption,
          writable: true,
          enumerable: true
        })
        // true = freshly browsed/dropped, not uploaded yet; the submitting button sets it to false after uploadimg succeeds
        Object.defineProperty(renamedFile, 'uploadPending', {
          value: true,
          writable: true,
          enumerable: true
        })
        return {
          file: renamedFile,
          url: URL.createObjectURL(renamedFile)
        }
      })

      if (singleSelect) {
        if (typeof onChange === 'function') {
          onChange([{ file: filesWithUrls[0].file, url: filesWithUrls[0].url }])
        }
        return [filesWithUrls[0]]
      } else {
        const updatedFiles: FilesType[] = [...prevFiles, ...filesWithUrls]
        if (typeof onChange === 'function') {
          onChange(updatedFiles.map((f: any) => ({ file: f.file, url: f.url })))
        }
        return updatedFiles
      }
    })
  }

  const getFillClasses = () => {
    if (!fillContainer) return "";
    return "w-full h-full";
  };

  const getContentAlignClasses = () => {
    switch (contentAlign) {
      case "left":
        return "left";
      case "right":
        return "right";
      case "center":
      default:
        return "center";
    }
  };

const removeFile = async (
    fileIndex: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    event.stopPropagation()
    const newFiles = [...files]
    newFiles.splice(fileIndex, 1)
    setFiles(newFiles)
    if (typeof onChange === 'function') {
      onChange(files.filter((_: any, index: number) => index !== fileIndex))
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: singleSelect ? false : true,
    disabled,
    onDrop: handleDrop,
    noClick: true,
    noDrag: !draggable,
    ...dropzoneOptions
  })

  const viewTypeUI=()=>{
    const isDark = theme === 'dark' || theme === 'dark-hc';

    return (
      <div className='h-full w-full p-4' {...getRootProps()}>
        <input {...getInputProps()} className='hidden' />
        <input
          id={id}
          type='file'
          multiple={!singleSelect}
          className='hidden'
          onChange={e => {
            const selectedFiles = Array.from(e.target.files || [])
            handleDrop(selectedFiles)
          }}
        />

        <div className='flex flex-col gap-4 h-full'>
          {/* Drop Zone */}
          <div
            className={`
              flex flex-col items-center justify-center
              min-h-[180px] p-6
              border-2 border-dashed rounded-lg
              transition-all duration-200 ease-in-out
              ${isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : isDark
                  ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }
            `}
            onClick={e => e.stopPropagation()}
          >
            {!isDragActive ? (
              <div className='flex flex-col items-center justify-center gap-3 text-center'>
                <div className={`p-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <MdOutlineCloudDownload size={28} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                </div>
                <div className='flex flex-col gap-1'>
                  <span className={`text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Choose a file to upload
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    JPEG, PNG, DOC, PDF, XLS, CSV and formats up to 5MB
                  </span>
                </div>
                <Button
                  pin='round-round'
                  view='outlined-info'
                  onClick={e => {
                    document.getElementById(id)?.click()
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  Browse File
                </Button>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center gap-3'>
                <div className='p-3 rounded-full bg-blue-100 dark:bg-blue-900/50'>
                  <FaArrowCircleDown size={28} className='text-blue-500' />
                </div>
                <span className={`text-base font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Drop your file here
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  JPEG, PNG, DOC, PDF, XLS, CSV and formats up to 5MB
                </span>
              </div>
            )}
          </div>

          {/* File List */}
          {files?.length > 0 && (
            <div className='flex flex-col gap-2 max-h-[200px] overflow-y-auto scrollbar-thin'>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Uploaded Files ({files?.length})
              </span>
              {files.map((file: any, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between
                    p-3 rounded-lg
                    cursor-pointer select-none
                    transition-all duration-150
                    ${isDark
                      ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                      : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
                    }
                  `}
                  onClick={e => {
                    e.stopPropagation()
                    setCurrentFile(file)
                    setPreviewModel(true)
                  }}
                >
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <div className='flex-shrink-0'>
                      {getFileIcon(file.file)}
                    </div>
                    <div className='flex flex-col min-w-0 flex-1'>
                      <span className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {file.file.name}
                      </span>
                      <div className='flex items-center gap-2 text-xs'>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {bytestoKb(file.file.size)}
                        </span>
                        <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}></span>
                        <div className='flex items-center gap-1 text-green-500'>
                          <Completed />
                          <span>Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className={`
                      p-2 rounded-full
                      transition-all duration-150
                      ${isDark
                        ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300'
                        : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                      }
                    `}
                    onClick={(e: any) => removeFile(index, e)}
                  >
                    <RiDeleteBinLine size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }


  const uploaderElement = (
    <div className={`flex 
          ${getFillClasses()} ${fillContainer ? "overflow-hidden" : ""}`}>

        <div
          className={`flex  w-full ${fillContainer ? "w-full h-full" : ""}`}
          {...getRootProps()}
        >
          {viewType=='modal'?
          <div className={`flex  w-full ${fillContainer ? "w-full h-full" : "justify-start"} ${className}`}>
            <Button
              pin='round-round'
              disabled={disabled}
              fillContainer={fillContainer}
              contentAlign={`${getContentAlignClasses()}`}
              className={` w-full  ${className}`}
              startContent={
                <span className='flex items-center justify-center'>
                  <span style={{ width: "1em", height: "1em", fontSize: "var(--font-size-base)", display: "inline-flex" }}>
                    <Icon data='FaCloudUploadAlt' fillContainer />
                  </span>
                </span>
              }
              onClick={e => {
                setOpen(true)
                e.stopPropagation()
              }}
            >
              Upload
            </Button>
          </div>:viewTypeUI()
          }
        </div>
         {viewType=='modal'?<Modal
          open={open}
          className='p-4'
          title={
            <div className={`${getBorderRadiusClass(branding.borderRadius)} flex items-center gap-3 px-1 py-1`}>
              <div className={`p-2 rounded-lg ${theme === 'dark' || theme === 'dark-hc' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <TbFileUpload size={24} className='text-blue-500' />
              </div>
              <div className={`flex flex-col ${getBorderRadiusClass(branding.borderRadius)}`}>
                <span className={`text-base font-semibold ${theme === 'dark' || theme === 'dark-hc' ? 'text-gray-100' : 'text-gray-800'}`}>
                  Upload Document
                </span>
                <span className={`text-xs ${theme === 'dark' || theme === 'dark-hc' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Select and upload the required documents
                </span>
              </div>
            </div>
          }
          onClose={() => {
            setOpen(false)
          }}>
          {viewTypeUI()}
          </Modal>:  null }

        {preview && (
          <Modal
            open={previewModel}
            onClose={() => {
              setPreviewModel(false)
              // e.stopPropagation()
            }}
            // contentOverflow='visible'
          >
            <Viewer
              file={currentFile?.file as File}
              url={currentFile?.url as string}
              closeFn={setPreviewModel}
            />
          </Modal>
        )}
     
    </div>
  );

  return (
    <CommonHeaderAndTooltip
      needTooltip={needTooltip}
      tooltipProps={tooltipProps}
      headerText={headerText}
      headerPosition={headerPosition}
      className={className}
      fillContainer={fillContainer}
    >
      {uploaderElement}
    </CommonHeaderAndTooltip>
  )
}


export default DocumentUploader;

const getFileIcon = (file: File | string) => {
  let fileType = ''

  if (typeof file === 'string') {
    fileType = file.split('.').pop()?.toLowerCase() || ''
  } else {
    fileType = file.name.split('.').pop()?.toLowerCase() || ''
  }

  switch (fileType) {
    case 'pdf':
      return <FaFilePdf className='text-red-500' size={30} />
    case 'doc':
    case 'docx':
      return <FaFileWord className='text-blue-500' size={30} />
    case 'xls':
    case 'xlsx':
      return <FaFileExcel className='text-green-500' size={30} />
    case 'ppt':
    case 'pptx':
      return <FaFilePowerpoint className='text-orange-500' size={30} />
    case 'csv':
      return <FaFileCsv className='text-green-500' size={30} />
    case 'json':
      return <BsFiletypeJson className='text-violet-500' size={30} />
    case 'zip':
    case 'rar':
    case '7z':
      return <FaFileArchive className='text-orange-500' size={30} />
    case 'txt':
      return <FaFileAlt className='text-gray-500' size={30} />
    case 'html':
      return <FaHtml5 className='text-orange-500' size={30} />
    case 'css':
      return <FaCss3Alt className='text-blue-500' size={30} />
    case 'scss':
      return <FaSass className='text-pink-500' size={30} />
    case 'md':
      return <FaMarkdown className='text-black' size={30} />
    case 'env':
      return <FaFileCode className='text-green-500' size={30} />
    case 'js':
      return <IoLogoJavascript className='text-yellow-500' size={30} />
    case 'jsx':
      return <SiReact className='text-blue-500' size={30} />
    case 'ts':
      return <SiTypescript className='text-blue-500' size={30} />
    case 'tsx':
      return (
        <span className='flex items-center'>
          <SiReact className='text-blue-500' size={25} />
          <SiTypescript className='text-blue-500' size={15} />
        </span>
      )
    case 'png':
      return <BsFiletypePng className='text-green-500' size={30} />
    case 'jpg':
      return <BsFiletypeJpg className='text-teal-500' size={30} />
    case 'avif':
      return <BsImage className='text-cyan-400' size={30} />
    case 'jfif':
      return <BsImage className='text-lime-400' size={30} />
    default:
      return <FaFileAlt className='text-gray-500' size={30} />
  }
}

const bytestoKb = (units: number) => {
  let unit = units / 1024
  return `${unit.toFixed(2)} KB`
}

const Viewer = ({ file, url, closeFn }: any) => {
  const [sheetData, setSheetData] = useState<any[]>([])

  useEffect(() => {
    if (!file) return

    // Determine file type for Excel or CSV
    const isExcel =
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      (file.name && (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')))

    const isCSV =
      file.type === 'text/csv' || (file.name && file.name.endsWith('.csv'))

    if (!isExcel && !isCSV) {
      setSheetData([])
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      const data = e.target?.result
      if (!data) return

      let workbook

      if (isCSV) {
        // Parse CSV
        workbook = XLSX.read(data, { type: 'binary', raw: false })
      } else {
        // Parse Excel
        workbook = XLSX.read(data, { type: 'binary' })
      }

      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      setSheetData(jsonSheet)
    }

    reader.readAsBinaryString(file)
  }, [file])

  return (
    <>
      {file && (
        <div
          key={file.name}
          className=' overflow-hidden rounded-md border p-2'
        >
            <p className='text-sm font-semibold'>{file.name}</p>
          {/* Image */}
          {file.type.includes('image') && (
            <div className='scrollbar-none flex h-full w-full items-center justify-center overflow-scroll'>
              <Image
                src={url}
                alt={file.name}
                width={500}
                height={500}
                className='rounded-md object-cover'
              />
            </div>
          )}

          {/* PDF */}
          {file.type.includes('pdf') && (
            <iframe
              src={url}
              width='100%'
              height='345px'
              className='rounded-md border'
            ></iframe>
          )}

          {/* Text or JSON */}
          {(file.type.includes('text') || file.type.includes('json')) &&
            !(
              file.type === 'text/csv' || // Don't double render CSV here
              (file.name && file.name.endsWith('.csv'))
            ) && (
              <div className='flex h-[53vh] w-full items-center justify-center'>
                <DocViewer
                  files={[{
                    url: url,
                    fileName: file.name,
                    fileType: file.type
                  }]}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </div>
            )}

          {/* Excel or CSV preview */}
          {(file.type ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel' ||
            file.type === 'text/csv' ||
            (file.name &&
              (file.name.endsWith('.xls') ||
                file.name.endsWith('.xlsx') ||
                file.name.endsWith('.csv'))) ) &&
            sheetData.length > 0 && (
              <div className='overflow-auto max-h-[53vh] border rounded-md p-2'>
                <table className='table-auto border-collapse border border-gray-300 w-full text-sm'>
                  <tbody>
                    {sheetData.map((row, i) => (
                      <tr key={i} className={i === 0 ? 'font-bold bg-gray-100' : ''}>
                        {row.map((cell: any, j: number) => (
                          <td
                            key={j}
                            className='border border-gray-300 px-2 py-1'
                          >
                            {cell ?? ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          {/* Unsupported */}
          {!file.type.includes('image') &&
            !file.type.includes('pdf') &&
            !file.type.includes('text') &&
            !(
              file.type ===
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
              file.type === 'application/vnd.ms-excel' ||
              file.type === 'text/csv' ||
              (file.name &&
                (file.name.endsWith('.xls') ||
                  file.name.endsWith('.xlsx') ||
                  file.name.endsWith('.csv')))
            ) && (
              <div className='flex h-[53vh] w-full items-center justify-center'>
                <div className='flex flex-col items-center gap-1 p-2'>
                  <BiHide
                    size={35}
                    color='red'
                    opacity={0.5}
                    strokeWidth={0.2}
                  />
                  <span className='text-xs text-gray-500'>
                    Preview not available
                  </span>
                  <a
                    href={url}
                    download={file.name}
                    className='text-sm text-blue-500 underline'
                  >
                    Download {file.name}
                  </a>
                </div>
              </div>
            )}
        </div>
      )}
    </>
  )
}

const Completed = () => {
  return (
    <svg
      width='17'
      height='16'
      viewBox='0 0 17 16'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M8.39421 1.33334C4.72087 1.33334 1.72754 4.32668 1.72754 8.00001C1.72754 11.6733 4.72087 14.6667 8.39421 14.6667C12.0675 14.6667 15.0609 11.6733 15.0609 8.00001C15.0609 4.32668 12.0675 1.33334 8.39421 1.33334ZM11.5809 6.46668L7.80087 10.2467C7.70754 10.34 7.58087 10.3933 7.44754 10.3933C7.31421 10.3933 7.18754 10.34 7.09421 10.2467L5.20754 8.36001C5.01421 8.16668 5.01421 7.84668 5.20754 7.65334C5.40087 7.46001 5.72087 7.46001 5.91421 7.65334L7.44754 9.18668L10.8742 5.76001C11.0675 5.56668 11.3875 5.56668 11.5809 5.76001C11.7742 5.95334 11.7742 6.26668 11.5809 6.46668Z'
        fill='#3EBF8F'
      />
    </svg>
  )
}