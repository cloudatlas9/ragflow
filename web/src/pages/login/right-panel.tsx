import { Flex, Typography } from 'antd';
import styles from './index.less';

const { Title, Text } = Typography;

const LoginRightPanel = () => {
  return (
    <section className={styles.rightPanel}>
      <Flex
        vertical
        align="center"
        justify="center"
        gap={32}
        className={styles.customRightPanel}
      >
        <img src="/logo.svg" alt="Logo" className={styles.logo} />
        <Title level={1} className={styles.welcomeTitle}>
          Willkommen zum Quick Responder
        </Title>
        <Text className={styles.welcomeDescription}>
          Ihr intelligenter Assistent für schnelle und präzise Antworten auf
          alle Ihre Fragen.
        </Text>
      </Flex>
    </section>
  );
};

export default LoginRightPanel;
