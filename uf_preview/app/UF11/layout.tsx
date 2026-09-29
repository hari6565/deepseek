
import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { LanguageProvider } from '../components/languageContext';
import LayoutDecider from '../components/Layout/LayoutDecider';
import { GlobalProvider } from '@/context/GlobalContext';
import { EventBusProvider } from '@/context/EventBusContext';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import { cookies } from 'next/headers';
import { COOKIE_PREFIX } from '@/lib/cookies';
import { GetSetupKey } from '../utils/setUpKey';

export const metadata: Metadata = {
  title: 'TGW4 | dddd',
  description: 'Screen generated from Torus metadata key: CK:CT001:FNGK:AF:FNK:UF-UFW:CATK:TGW01:AFGK:TGW004:AFK:barchart:AFVK:v1'
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const tokenParam = cookieStore.get(`${COOKIE_PREFIX}_token`)?.value
  console.log(tokenParam , "token param from layout");

  return (
  <GlobalProvider tokenParam={tokenParam ?? ""}>
    <EventBusProvider>
      <ThemeWrapper>
      <LanguageProvider>
        <GetSetupKey>
        <div className=''>
          <LayoutDecider 
            mode='detached' 
            navigationStyles='vertical' 
            sidebarStyle='compact'
            >
            <div>
              <main>{children}</main>    
            </div>      
              <ToastContainer />
            </LayoutDecider>
          </div>
        </GetSetupKey>
      </LanguageProvider>
      </ThemeWrapper>
    </EventBusProvider>
  </GlobalProvider>
  )
}
