// Scan Service Helper - WebSocket connection to scanner service
// TypeScript equivalent of scan-service-helper.js
import { AxiosService } from '../components/axiosService'

// Types
export interface ScanImage {
  imagetypeid?: string
  scantype?: string
  status?: string
  DOCUMENTNAME?: string
  DOCNAME?: string
  IMAGESTATUS?: string
}

export interface ScanInputs {
  SCAN_TYPE?: string
  SCANNER_TYPE?: string
  AMENDCANCELTYPE?: string
  IMG_SPEC?: string
  LAST_DOCUMENT_NAME?: string
  TOTAL_TRAN_COUNT?: string
  PDF_IMG_CONVERTION_PAGES?: any
  MAX_NO_OF_PAGES?: any
}

export interface ScanComponent {
  retrySaveDisable?: boolean
  retry?: boolean
  showInfoPopup?: (type: string) => void
  SCAN_PARAMS?: {
    scan_ver_check?: string
    ctrl_num_check?: string
    scanner_type?: string
  }
  scanServiceVersion?: string
  http?: {
    getVersionDetail: () => void
  }
  batchControlCount?: number
  bindValueToGrid?: (type: string) => void
  hideLoader?: () => void
  PDF_IMG_CONVERTION_PAGES?: any
  MAX_NO_OF_PAGES?: any
}

// Declared imagelist variable for storing scanned image list
let imagelist: ScanImage[] = []
let imageInfoArr: ScanImage[] = []
let conn: WebSocket | Record<string, never> = {}
let version_num: string | undefined
// const {scanurl, setScanurl}= useContext(TotalContext) as TotalContextProps;

// scanComponent reference - should be set by the consuming component
export let scanComponent: ScanComponent = {}

// Set the scan component reference
export function setScanComponent(component: ScanComponent): void {
  scanComponent = component
}

// Closing socket connection
export function closeSocketConnection(): void {
  if (Object.keys(conn).length > 0) {
    ;(conn as WebSocket).close()
    scanComponent.retrySaveDisable = false
    if (typeof scanComponent.retry == 'boolean') {
      scanComponent.retry = false
    }
  }
}

// Connecting scan service through websocket
export function connectscan(): any {
  try {
    return new Promise(function (resolve, reject) {
      try {
        const arrConnKeys = Object.keys(conn)
        if (!(arrConnKeys.length > 0)) {
          conn = new WebSocket('ws://localhost:2012/')
          console.log('socket connection status', conn)
        } else {
          resolve(conn as WebSocket)
        }

        ;(conn as WebSocket).onerror = function (e) {
          reject({
            error:
              'Scan service is not started, Please start scan service and try again.' +
              JSON.stringify(e)
          })
          if (typeof scanComponent.showInfoPopup == 'function') {
            scanComponent.showInfoPopup('SHOW_SCANNER_STATUS')
          }
          setScannerStatus(
            'FAILURE',
            'Scan service is not started, Please restart and try again.'
          )
          console.log(
            'On error event scan service not started.(connectscan)',
            e
          )
        }

        ;(conn as WebSocket).onmessage = function (ver) {
          if (
            scanComponent.SCAN_PARAMS &&
            scanComponent.SCAN_PARAMS.scan_ver_check == 'Y'
          ) {
            version_num = JSON.parse(ver.data)[0].BUILD_VERSION //[{"BUILD_VERSION":"1.0.0"}]
            scanComponent.scanServiceVersion = version_num
            scanComponent.http?.getVersionDetail()
            console.log('version_num', version_num)
          }
        }

        ;(conn as WebSocket).onopen = function () {
          resolve(conn as WebSocket)
          if (
            scanComponent.SCAN_PARAMS &&
            scanComponent.SCAN_PARAMS.scan_ver_check == 'Y'
          ) {
            const scanInputs: ScanInputs = {}
            scanInputs.SCAN_TYPE = 'GET_VERSION'
            ;(conn as WebSocket).send(JSON.stringify(scanInputs))
          }
          setScannerStatus(
            'SUCCESS',
            ' Scanner Status :   Transporter is ready to feed'
          )
        }

        // (conn as WebSocket).onclose = function (e) {
        //   console.log('socket on close', e);
        //   conn = {};
        // };
      } catch (e) {
        console.log('socket connection events error', e)
        setScannerStatus(
          'FAILURE',
          ' Scanner Status :  Transporter is not ready to feed. Please check.'
        )
        reject({
          error: 'Connection Failed. Please start the scan service provider.'
        })
      }
    })
  } catch (e) {
    alert('Connection Failed. Please start the scan service provider.')
    console.log('scket conn promise exception', e)
    return undefined
  }
}

// Connect scan service and get scanned images
export async function socketScan(scanInputs: ScanInputs,token:string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Scan type', scanInputs.SCAN_TYPE)
      const connection = connectscan()
      connection
        ?.then(async function (wsConn: WebSocket) {
          console.log(scanInputs.SCAN_TYPE + '- SCAN_TYPE')
          if (
            scanInputs.SCAN_TYPE != 'SHOW_IMAGES' &&
            scanInputs.SCAN_TYPE != 'SAVE_IMAGES' &&
            scanInputs.SCAN_TYPE != 'CLEAR_IMAGES'
          ) {
            // send input parameters to window service
            wsConn.send(JSON.stringify(scanInputs))
            // get response from window service
            wsConn.onmessage = async function (resp) {
              console.log(
                'Scan service provider images are received successfully - GETIMAGES',
                resp
              )
              const newImageList: ScanImage[] = []
              const list = resp.data

              console.log('response data', list)
              // return list
              if (resp.data === '[]') {
                console.log('No images selected - user cancelled')
                await setScannerStatus(
                  'SUCCESS',
                  ' Scanner Status :  No images selected'
                )
                resolve(null)
              } else {
                // parse the JSON string, constructing JSON object from the response data
                const scanresponseData = JSON.parse(list)
                if (
                  !Array.isArray(scanresponseData) &&
                  scanresponseData.ERROR_CODE == 'SHOW_ERROR'
                ) {
                  console.log(
                    'Error Message From Scan Service',
                    scanresponseData.ERROR_MSG
                  )
                  await setScannerStatus(
                    'FAILURE',
                    '   Something went wrong during scan. Please try again'
                  )
                  reject(new Error(scanresponseData.ERROR_MSG || 'Scan error'))
                } else {
                  if (scanresponseData[0]?.BUILD_VERSION) {
                    resolve(null)
                    return
                  }
                  console.log('Processing Scan Data')
                  for (
                    let iloop = 0;
                    iloop < scanresponseData.length;
                    iloop++
                  ) {
                    const scandata = scanresponseData[iloop]
                    console.log('Image Data -', scandata)
                    // setScanurl(scandata);
                    if (scanresponseData[iloop].status !== 'CLEAR_IMAGE') {
                      // pushing every JSON object into imagelist array
                      imagelist.push(scandata)
                      newImageList.push(scandata)
                    }
                  }
                  // Get total count of imagelist
                  if (newImageList.length > 0) {
                    if (scanInputs.SCAN_TYPE !== 'CHEQUE') {
                      await setScannerStatus(
                        'SUCCESS',
                        ' Scanner Status :  FEEDINGSTOPPED'
                      )
                    }
                    newImageList.forEach(function (element) {
                      // Need to Investigate
                      if (element.scantype === 'CHEQUE') {
                        const Tran = newImageList.filter(function (x) {
                          return x.DOCUMENTNAME === element.DOCUMENTNAME
                        })
                        if (Tran.length) {
                          if (element.imagetypeid === '3') {
                            imageInfoArr.push(element)
                            console.log('imageInfoArr', imageInfoArr)
                          } else {
                            const tiffFrontAvail = newImageList.filter(
                              function (x) {
                                return (
                                  x.DOCUMENTNAME === element.DOCUMENTNAME &&
                                  x.imagetypeid === '3'
                                )
                              }
                            )

                            if (!tiffFrontAvail.length) {
                              const isAlreadyExists = imageInfoArr.filter(
                                function (res) {
                                  return (
                                    res.DOCUMENTNAME === Tran[0].DOCUMENTNAME
                                  )
                                }
                              )
                              if (!isAlreadyExists.length) {
                                imageInfoArr.push(Tran[0])
                                console.log('imageInfoArr', imageInfoArr)
                              }
                            }
                          }
                        }
                      } else {
                        if (
                          element.status !== 'STARTFEED' &&
                          element.status !== 'FEEDINGSTOPPED' &&
                          element.status !== 'CLEAR_IMAGE'
                        ) {
                          console.log('Status for an element', element.status)
                          if (element.IMAGESTATUS == 'PDF') {
                            if (element.DOCNAME?.split('_')[1] === '1') {
                              imageInfoArr.push(element)
                              console.log('imageInfoArr', imageInfoArr)
                            }
                          } else {
                            imageInfoArr.push(element)
                          }
                        }
                      }
                    })
                    getImageData()
                    getImageDataArr()
                  }
                  if (
                    scanresponseData[0].status !== 'STARTFEED' &&
                    scanresponseData[0].status !== 'FEEDINGSTOPPED' &&
                    scanresponseData[0].status !== 'CLEAR_IMAGE'
                  ) {
                    if (scanComponent.SCAN_PARAMS?.ctrl_num_check === 'Y') {
                      if (
                        typeof scanComponent.showInfoPopup == 'function' &&
                        imageInfoArr.length !== scanComponent.batchControlCount
                      ) {
                        // scanComponent.showInfoPopup('TRAN_COUNT');
                      }
                    }
                  }
                  scanComponent.bindValueToGrid?.(
                    scanInputs.AMENDCANCELTYPE || ''
                  )
                  console.log('Bind value called')
                  resolve(scanresponseData)
                }
              }
            }
          }
        })
        .catch((error: any) => {
          reject(error)
        })
    } catch (e) {
      alert('Connection failed. Please restart scan service.')
      console.log(
        'Connection to scan service failed. Please restart the scan service.(socketScan)',
        e
      )
      reject(e)
    }
  })
}

// Display listed images in sidebar
export function Rangerscan(scanInputs: ScanInputs): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      console.log('ranger scan', scanInputs)
      // connect to scan service
      const connection = connectscan()
      connection
        ?.then(function (wsConn: WebSocket) {
          // send input parameters to window service
          wsConn.send(JSON.stringify(scanInputs))
          // get response from window service
          wsConn.onmessage = async function (resp) {
            console.log('Ranger scan', resp)
            const list = resp.data
            const imageresult = JSON.parse(list)[0]
            console.log('Image result in rangerscan', imageresult.status)
            if (imageresult.status == 'CLEAR_IMAGE') {
              if (imagelist.length == 0) {
                resolve('')
                return
              }
            }
            const scnstatus =
              '  Scanner Status : ' +
              imageresult.status.split('S')[0] +
              ' ' +
              'S' +
              imageresult.status.split('S')[1]
            setScannerStatus('SUCCESS', scnstatus)
            try {
              await Preparescandata(scanInputs, imageresult.status,"")
              resolve(imageresult)
            } catch (error) {
              reject(error)
            }
          }
        })
        .catch((error: any) => {
          reject(error)
        })
    } catch (e) {
      alert('Connection failed. Please restart scan service.')
      console.log('Connection Failed in Ranger Scanner.', e)
      reject(e)
    }
  })
}

// Scan input parameters formation
export async function Scan(
  scan_type: string,
  scanner_type: string,
  img_spec: string,
  token: string
): Promise<any> {
  let scanInputs: ScanInputs
  // set inputs to pass the parameter
  scanInputs = {}
  scanInputs.SCAN_TYPE = scan_type
  scanInputs.SCANNER_TYPE = scanner_type
  scanInputs.IMG_SPEC = img_spec
  scanInputs.LAST_DOCUMENT_NAME = imageInfoArr.length
    ? imageInfoArr[imageInfoArr.length - 1].DOCNAME
    : ''
  scanInputs.TOTAL_TRAN_COUNT = imageInfoArr.length
    ? String(imageInfoArr.length)
    : '0'
  if (scanInputs.SCANNER_TYPE == 'CHEQUE_SCANNER') {
    // if scannertype is CHEQUE_SCANNER then set scan type is CONNECT_RANGER
    scanInputs.SCAN_TYPE = 'CONNECT_RANGER'
    console.log('CONNECT_RANGER')
    console.log('fn Scan scanInputs cheque', scanInputs)
    return await Rangerscan(scanInputs)
  } else {
    scanInputs.PDF_IMG_CONVERTION_PAGES = scanComponent.PDF_IMG_CONVERTION_PAGES
    scanInputs.MAX_NO_OF_PAGES = scanComponent.MAX_NO_OF_PAGES
    console.log('fn Scan scanInputs document', scanInputs)
    return await Preparescandata(scanInputs, '',token)
  }
}

// Preparing scan type
export async function Preparescandata(
  scanInputs: ScanInputs,
  imageresultstatus: string,
  token:string
): Promise<any> {
  console.log('image result status in prepare scandata', imageresultstatus)
  if (scanInputs.SCANNER_TYPE == 'CHEQUE_SCANNER') {
    if (imageresultstatus == 'FEEDINGSTOPPED') {
      // if scan type is CHEQUE_SCANNER and the status is FEEDINGSTOPPED then the scantype is changed RANGER_GETIMAGES
      scanInputs.SCAN_TYPE = 'RANGER_GETIMAGES'
      // pass the inputs to socketScan
      return await socketScan(scanInputs,token)
    }
  } else {
    // if scan type is not CHEQUE_SCANNER then pass the input to socketScan
    return await socketScan(scanInputs,token)
  }
  return null
}

// Set model value to bind transaction into list
export function getImageData(): ScanImage[] {
  return imageInfoArr // it contains tiff front image. If tiff front is missing, then the tiff_back | jpeg_front | jpeg_back will be here.
}

// Set model value to scan component
export function getImageDataArr(): ScanImage[] {
  return imagelist // it contains all scanned data.
}

export async function setScannerStatus(status: string, msg: string) {
  if (document.getElementById('scannerStatus')) {
    if (status == 'SUCCESS') {
      ;(document.getElementById('scannerStatus') as HTMLElement).style.color =
        'rgb(19, 125, 6)'
    } else {
      ;(document.getElementById('scannerStatus') as HTMLElement).style.color =
        'rgb(249, 3, 14)'
    }
    ;(document.getElementById('scannerStatus') as HTMLElement).innerHTML = msg
  }
  if (typeof scanComponent.hideLoader == 'function') {
    scanComponent.hideLoader()
  }
}
