import { PageHeader } from '@/components/page-header';
import chatService from '@/services/chat-service';
import {
  DislikeOutlined,
  LikeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  Input,
  Pagination,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MessageSquareText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'umi';

const { Text, Paragraph } = Typography;
const { Option } = Select;

interface FeedbackItem {
  conversation_id: string;
  conversation_name: string;
  message_id: string;
  user_question: string;
  assistant_content: string;
  thumbup: boolean | null;
  feedback: string;
  timestamp: number;
  conversation_type: 'regular' | 'api';
  dialog_id?: string;
  user_id?: string;
}

interface FeedbackResponse {
  total: number;
  page: number;
  page_size: number;
  items: FeedbackItem[];
}

export default function FeedbackPage() {
  const navigate = useNavigate();

  // State for filters and pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keywords, setKeywords] = useState('');
  const [thumbupFilter, setThumbupFilter] = useState<string | null>(null);

  // Fetch feedback data
  const {
    data: feedbackData,
    isLoading,
    refetch,
    error,
  } = useQuery<FeedbackResponse>({
    queryKey: ['feedback', page, pageSize, keywords, thumbupFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (keywords.trim()) {
        params.append('keywords', keywords);
      }

      if (thumbupFilter) {
        params.append('thumbup', thumbupFilter);
      }

      const response = await chatService.listFeedback(params);
      console.log('Feedback API Response:', response); // Debug log

      // Handle case where response.data might be undefined or malformed
      if (!response.data) {
        return { total: 0, page: 1, page_size: pageSize, items: [] };
      }

      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  // Handle navigation to conversation
  const handleViewConversation = (record: FeedbackItem) => {
    if (record.conversation_type === 'regular') {
      // Navigate to regular chat conversation
      navigate(
        `/chat?conversation_id=${record.conversation_id}&dialog_id=${record.dialog_id}`,
      );
    } else {
      // For API conversations, we might not have a direct view, show a message
      console.log('API conversation view not implemented yet');
    }
  };

  // Table columns definition
  const columns: ColumnsType<FeedbackItem> = useMemo(
    () => [
      {
        title: 'Rating',
        dataIndex: 'thumbup',
        key: 'thumbup',
        width: 80,
        render: (thumbup: boolean | null) => (
          <div style={{ textAlign: 'center' }}>
            {thumbup === true && (
              <LikeOutlined style={{ color: '#52c41a', fontSize: 18 }} />
            )}
            {thumbup === false && (
              <DislikeOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
            )}
          </div>
        ),
        filters: [
          { text: 'Thumbs Up', value: 'true' },
          { text: 'Thumbs Down', value: 'false' },
        ],
        filteredValue: thumbupFilter ? [thumbupFilter] : null,
        onFilter: () => true, // Filtering is handled by API
      },
      {
        title: 'User Question',
        dataIndex: 'user_question',
        key: 'user_question',
        width: 250,
        render: (text: string) => (
          <Tooltip title={text} placement="topLeft">
            <Paragraph
              ellipsis={{ rows: 2, expandable: false }}
              style={{ margin: 0, maxWidth: 230 }}
            >
              {text}
            </Paragraph>
          </Tooltip>
        ),
      },
      {
        title: 'AI Response',
        dataIndex: 'assistant_content',
        key: 'assistant_content',
        render: (text: string) => (
          <Tooltip title={text} placement="topLeft">
            <Paragraph
              ellipsis={{ rows: 2, expandable: false }}
              style={{ margin: 0, maxWidth: 300 }}
            >
              {text}
            </Paragraph>
          </Tooltip>
        ),
      },
      {
        title: 'Feedback Text',
        dataIndex: 'feedback',
        key: 'feedback',
        width: 200,
        render: (text: string) =>
          text ? (
            <Tooltip title={text} placement="topLeft">
              <Paragraph
                ellipsis={{ rows: 2, expandable: false }}
                style={{ margin: 0, maxWidth: 180 }}
              >
                {text}
              </Paragraph>
            </Tooltip>
          ) : (
            <Text type="secondary">No feedback text</Text>
          ),
      },
      {
        title: 'Conversation',
        key: 'conversation_info',
        width: 180,
        render: (_, record: FeedbackItem) => (
          <div>
            <Paragraph
              ellipsis={{ rows: 1, expandable: false }}
              style={{ margin: 0, marginBottom: 4, maxWidth: 160 }}
            >
              {record.conversation_name}
            </Paragraph>
            <div>
              <Tag
                color={
                  record.conversation_type === 'regular' ? 'blue' : 'orange'
                }
              >
                {record.conversation_type === 'regular' ? 'Chat' : 'API'}
              </Tag>
            </div>
          </div>
        ),
      },
      {
        title: 'Date',
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: 120,
        render: (timestamp: number) => (
          <Text>{new Date(timestamp * 1000).toLocaleDateString()}</Text>
        ),
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 100,
        render: (_, record: FeedbackItem) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<MessageSquareText size={14} />}
              onClick={() => handleViewConversation(record)}
              disabled={record.conversation_type === 'api'} // Disable for API conversations for now
            >
              View
            </Button>
          </Space>
        ),
      },
    ],
    [thumbupFilter, navigate],
  );

  // Handle search
  const handleSearch = (value: string) => {
    setKeywords(value);
    setPage(1); // Reset to first page when searching
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setThumbupFilter(value);
    setPage(1); // Reset to first page when filtering
  };

  // Handle pagination change
  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  // Handle table change (for sorting and filtering)
  const handleTableChange = (pagination: any, filters: any) => {
    if (filters.thumbup) {
      setThumbupFilter(filters.thumbup[0] || null);
    } else {
      setThumbupFilter(null);
    }
    setPage(1);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Feedback Insights" back={() => navigate('/')} />

      <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        {/* Error Display */}
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: 16,
              backgroundColor: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: 6,
            }}
          >
            <Text type="danger">
              Error loading feedback data:{' '}
              {(error as any)?.message || 'Unknown error'}
            </Text>
          </div>
        )}

        <Card>
          {/* Summary Stats */}
          <div style={{ marginBottom: 24 }}>
            <Space size={24}>
              <Badge count={feedbackData?.total || 0} showZero color="blue">
                <Text strong>Total Feedback</Text>
              </Badge>
              <Badge
                count={
                  feedbackData?.items?.filter((item) => item.thumbup === true)
                    .length || 0
                }
                showZero
                color="green"
              >
                <Text strong>Positive</Text>
              </Badge>
              <Badge
                count={
                  feedbackData?.items?.filter((item) => item.thumbup === false)
                    .length || 0
                }
                showZero
                color="red"
              >
                <Text strong>Negative</Text>
              </Badge>
            </Space>
          </div>

          {/* Filters */}
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <Input.Search
              placeholder="Search in questions, responses, or feedback text..."
              style={{ maxWidth: 400 }}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
            />

            <Select
              placeholder="Filter by rating"
              style={{ width: 150 }}
              value={thumbupFilter}
              onChange={handleFilterChange}
              allowClear
            >
              <Option value="true">👍 Positive</Option>
              <Option value="false">👎 Negative</Option>
            </Select>

            <Button onClick={() => refetch()}>Refresh</Button>
          </div>

          {/* Table */}
          <Table<FeedbackItem>
            columns={columns}
            dataSource={feedbackData?.items || []}
            loading={isLoading}
            rowKey="message_id"
            pagination={false}
            scroll={{ x: 1200 }}
            size="middle"
            onChange={handleTableChange}
          />

          {/* Pagination */}
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={feedbackData?.total || 0}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} feedback items`
              }
              onChange={handlePageChange}
              pageSizeOptions={['10', '20', '50', '100']}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
