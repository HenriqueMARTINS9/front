import Card from "./Card";
import { Wine } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';

export default function AlertCard({ alerts }: { alerts: { type: 'error' | 'success' | 'warning'; message: string; category?: 'wine' | 'dish' | 'menu' }[] }) {
    const { t } = useTranslation();
    return (
      <Card title={t('common.alerts')} number={alerts.length === 0 ? t('common.noNotifications') : alerts.length.toString()}>
        {alerts.length === 0 ? (
          <div className="">
          </div>
        ) : (
          alerts.map((alert, i) => {
          const styles = {
            error: 'bg-[#FEF3F2] text-[#B42318]',
            success: 'bg-[#ECFDF3] text-[#027A48]',
            warning: 'bg-[#FFFAEB] text-[#B54708]'
          };
  
          // Icône de verre de vin pour les alertes liées aux vins
          const wineIconColor = alert.type === 'error' ? '#D92D20' : alert.type === 'success' ? '#12B76A' : '#DC6803';
          const wineIcon = (
            <Wine 
              size={25} 
              strokeWidth={2} 
              color={wineIconColor}
            />
          );

          const defaultIcons = {
            error: (
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 2V6M8.5 2V6M3.5 10H21.5M5.5 4H19.5C20.6046 4 21.5 4.89543 21.5 6V20C21.5 21.1046 20.6046 22 19.5 22H5.5C4.39543 22 3.5 21.1046 3.5 20V6C3.5 4.89543 4.39543 4 5.5 4Z" stroke="#D92D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
            success: (
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 22H4.5C3.96957 22 3.46086 21.7893 3.08579 21.4142C2.71071 21.0391 2.5 20.5304 2.5 20V13C2.5 12.4696 2.71071 11.9609 3.08579 11.5858C3.46086 11.2107 3.96957 11 4.5 11H7.5M14.5 9V5C14.5 4.20435 14.1839 3.44129 13.6213 2.87868C13.0587 2.31607 12.2956 2 11.5 2L7.5 11V22H18.78C19.2623 22.0055 19.7304 21.8364 20.0979 21.524C20.4654 21.2116 20.7077 20.7769 20.78 20.3L22.16 11.3C22.2035 11.0134 22.1842 10.7207 22.1033 10.4423C22.0225 10.1638 21.8821 9.90629 21.6919 9.68751C21.5016 9.46873 21.2661 9.29393 21.0016 9.17522C20.7371 9.0565 20.4499 8.99672 20.16 9H14.5Z" stroke="#12B76A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
            warning: (
              <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_10722_3217)">
                  <path d="M8.59999 13.34L11.43 10.51L4.40999 3.49999C2.84999 5.05999 2.84999 7.58999 4.40999 9.15999L8.59999 13.34ZM15.38 11.53C16.91 12.24 19.06 11.74 20.65 10.15C22.56 8.23999 22.93 5.49999 21.46 4.02999C20 2.56999 17.26 2.92999 15.34 4.83999C13.75 6.42999 13.25 8.57999 13.96 10.11L4.19999 19.87L5.60999 21.28L12.5 14.41L19.38 21.29L20.79 19.88L13.91 13L15.38 11.53Z" fill="#DC6803" />
                </g>
                <defs>
                  <clipPath id="clip0_10722_3217">
                    <rect width="24" height="24" fill="white" transform="translate(0.5)" />
                  </clipPath>
                </defs>
              </svg>
            )
          };

          // Utiliser l'icône de verre à pied si c'est une alerte liée aux vins, sinon l'icône par défaut
          const icon = alert.category === 'wine' ? wineIcon : defaultIcons[alert.type];
  
          return (
            <div
              key={i}
              className={`flex items-center p-1 gap-6 text-sm rounded font-medium ${styles[alert.type]}`}
            >
              {icon}
              <span>{alert.message}</span>
            </div>
          );
        }))}
      </Card>
    );
  }
  