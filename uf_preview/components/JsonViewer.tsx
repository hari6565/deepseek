import i18n from '@/app/components/i18n'
import { useGlobal } from '@/context/GlobalContext'
import JsonView from 'react18-json-view'
import { Text } from "./Text";
import { getFontSizeForSubHeader } from '@/app/utils/branding'
import { HeaderPosition, TooltipProps as TooltipPropsType } from '@/types/global'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'

interface JsonViewerProps {
  data: any
  className?: string
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
}

export const JsonViewer = ({
  data,
  className = '',
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = 'top'
}: JsonViewerProps) => {
  const keyset = i18n.keyset('language')
  const {branding} = useGlobal()

const jsonViewerElement = (
  <div className="h-full w-full flex flex-col overflow-hidden">
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      {data ? (
        <JsonView
          theme="atom"
          enableClipboard={false}
          src={data}
        />
      ) : (
        <Text className="p-2 text-center">
          {keyset('No Data available')}
        </Text>
      )}
    </div>
  </div>
)

  return (
    <CommonHeaderAndTooltip
      needTooltip={needTooltip}
      tooltipProps={tooltipProps}
      headerText={headerText}
      headerPosition={headerPosition}
      className={className}
    >
      {jsonViewerElement}
    </CommonHeaderAndTooltip>
  )
}