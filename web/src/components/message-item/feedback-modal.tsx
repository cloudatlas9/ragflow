import { Form, Input, Modal } from 'antd';

import { IModalProps } from '@/interfaces/common';
import { IFeedbackRequestBody } from '@/interfaces/request/chat';
import { useCallback } from 'react';

type FieldType = {
  feedback?: string;
};

interface FeedbackModalProps extends IModalProps<IFeedbackRequestBody> {
  thumbup: boolean;
}

const FeedbackModal = ({
  visible,
  hideModal,
  onOk,
  loading,
  thumbup,
}: FeedbackModalProps) => {
  const [form] = Form.useForm();

  const handleOk = useCallback(async () => {
    const ret = await form.validateFields();
    return onOk?.({ thumbup, feedback: ret.feedback });
  }, [onOk, form, thumbup]);

  return (
    <Modal
      title="Feedback"
      open={visible}
      onOk={handleOk}
      onCancel={hideModal}
      confirmLoading={loading}
    >
      <Form
        name="basic"
        labelCol={{ span: 0 }}
        wrapperCol={{ span: 24 }}
        style={{ maxWidth: 600 }}
        autoComplete="off"
        form={form}
      >
        <Form.Item<FieldType> name="feedback" rules={[]}>
          <Input.TextArea
            rows={8}
            placeholder="Please input your feedback (optional)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FeedbackModal;
