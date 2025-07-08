import { useFetchUserInfo } from '@/hooks/user-setting-hooks';
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React from 'react';
import { history } from 'umi';

import styles from '../../index.less';

const App: React.FC = () => {
  const { data: userInfo } = useFetchUserInfo();

  const toSetting = () => {
    history.push('/user-setting');
  };

  return (
    <Avatar
      size={32}
      onClick={toSetting}
      className={styles.clickAvailable}
      src={userInfo.avatar || undefined} // Show user avatar if available
      style={{
        backgroundColor: '#d9d9d9', // Gray background (for fallback)
        color: '#666666', // Darker gray for icon (for fallback)
      }}
      icon={!userInfo.avatar ? <UserOutlined /> : undefined} // Show icon only when no avatar
    />
  );
};

export default App;
