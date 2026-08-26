import logo from '../assets/logo.webp';
import smallLogo from '../assets/small-logo.webp';
import profilePlaceHolder from '../assets/img/profile2.jpeg';
import { casfodTemplateAddress } from '@/features/request-for-quotation/rfqConstants';

export interface IInfoConfig {
  name: string;
  abbriviation: string;
  motto: string;
  subLocation: string;
  smallLogoUrl: string;
  profilePlaceHolder: string;
  bigLogoUrl: string;
  date: string;
}

export const infoConfig: IInfoConfig = {
  name: 'CASFOD POSSIBILITY HUB',
  abbriviation: 'CASFOD',
  motto: '',
  subLocation: '',
  smallLogoUrl: `${smallLogo}`,
  bigLogoUrl: `${logo}`,
  profilePlaceHolder: `${profilePlaceHolder}`,
  date: '2026',
};

// Get the address based on casfodAddressId - use casfodTemplateAddress
export const getAddress = (data: any) => {
  const address = casfodTemplateAddress[data.casfodAddressId as keyof typeof casfodTemplateAddress];
  if (!address) {
    // Fallback to Borno address if not found
    return casfodTemplateAddress.borno;
  }
  return address;
};

