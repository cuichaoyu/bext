import './index.less';
import { Header } from '@/components/header';
import { CommonProvider } from '@/hooks';
import { initializeIcons } from '@fluentui/react';
import dayjs from 'dayjs';
import zhCn from 'dayjs/locale/zh-cn';
import { IRouteComponentProps } from 'umi';
import 'windi.css';

initializeIcons(
  'https://static2.sharepointonline.com/files/fabric/assets/icons/',
);

dayjs.locale(zhCn);

export default function Layout({
  children,
  location,
  route,
  history,
  match,
}: IRouteComponentProps) {
  return (
    <CommonProvider>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 overflow-auto flex flex-col">{children}</div>
      </div>
    </CommonProvider>
  );
}
