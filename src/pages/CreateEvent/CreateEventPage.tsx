import React, { useState } from "react";
import {
  Card,
  Steps,
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  Typography,
  message,
  Divider,
  List,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  GiftFilled,
  GiftOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { createEvent } from "../../services/api";

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

interface FormValues {
  name: string;
  description?: string;
  rules: string;
  deadline: Dayjs;
  organizerEmail: string;
  participants: { name: string; email: string }[];
}

const STEP_FIELDS: (keyof FormValues)[][] = [
  ["name", "description"],
  ["rules", "deadline"],
  ["participants"],
  ["organizerEmail"],
];

export default function CreateEventPage() {
  const [form] = Form.useForm<FormValues>();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const goNext = async () => {
    try {
      await form.validateFields(STEP_FIELDS[currentStep] as string[]);
      setCurrentStep((s) => s + 1);
    } catch {
      // lỗi validate đã hiển thị trên form
    }
  };

  const goBack = () => setCurrentStep((s) => s - 1);

  const handleFinish = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const result = await createEvent({
        name: values.name,
        description: values.description,
        rules: values.rules,
        deadline: values.deadline.toISOString(),
        organizerEmail: values.organizerEmail,
        participants: values.participants,
      });
      navigate("/success", { state: result });
    } catch (err) {
      message.error(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra. Vui lòng thử lại nhé!",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <Card className="page-card">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-block",
              padding: "16px",
              background: "#fff0f0",
              borderRadius: "50%",
              marginBottom: 16,
            }}
          >
            <GiftFilled style={{ fontSize: 36, color: "#ff5a5f" }} />
          </div>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            Create Gift Exchange Event{" "}
            <GiftOutlined style={{ color: "#ff5a5f", marginLeft: 4 }} />
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16, marginTop: 8 }}>
            Only a few simple steps, the system will help you shuffle and send
            secret invitations to everyone!
          </Paragraph>
        </div>

        <Steps
          current={currentStep}
          size="small"
          items={[
            { title: "Event" },
            { title: "Rules" },
            { title: "Participants" },
            { title: "Confirm" },
          ]}
          style={{ marginBottom: 40 }}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            participants: [
              { name: "", email: "" },
              { name: "", email: "" },
              { name: "", email: "" },
            ],
          }}
          onFinish={handleFinish}
          requiredMark={false}
        >
          <div
            style={{
              display: currentStep === 0 ? "block" : "none",
              animation: "fadeIn 0.5s",
            }}
          >
            <Form.Item
              label={<Text strong>What is the name of your event?</Text>}
              name="name"
              rules={[
                {
                  required: true,
                  message: "Don't forget to give your event a name!",
                },
              ]}
            >
              <Input size="large" placeholder="e.g., Warm Christmas 2026" />
            </Form.Item>
            <Form.Item
              label={<Text strong>Message (Optional)</Text>}
              name="description"
            >
              <TextArea
                rows={4}
                placeholder="A few sweet messages to warm up the atmosphere..."
              />
            </Form.Item>
          </div>

          <div
            style={{
              display: currentStep === 1 ? "block" : "none",
              animation: "fadeIn 0.5s",
            }}
          >
            <Form.Item
              label={<Text strong>Rules & Budget</Text>}
              name="rules"
              rules={[
                {
                  required: true,
                  message: "Please specify the rules so everyone knows them",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="e.g., Gifts worth around 200k, priority on handmade items, bring to office on Friday morning..."
              />
            </Form.Item>
            <Form.Item
              label={<Text strong>Deadline to Fill Wishlist</Text>}
              name="deadline"
              rules={[
                { required: true, message: "Please select the deadline" },
              ]}
            >
              <DatePicker
                showTime
                size="large"
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
                placeholder="Select date and time"
                disabledDate={(d) => d && d < dayjs().startOf("day")}
              />
            </Form.Item>
          </div>

          <div
            style={{
              display: currentStep === 2 ? "block" : "none",
              animation: "fadeIn 0.5s",
            }}
          >
            <Form.List
              name="participants"
              rules={[
                {
                  validator: async (_, participants) => {
                    // 1. Kiểm tra số lượng người tham gia tối thiểu
                    if (!participants || participants.length < 3) {
                      return Promise.reject(
                        new Error(
                          "The more the merrier! At least 3 participants required.",
                        ),
                      );
                    }

                    // 2. Kiểm tra xem có người tham gia nào bị trống tên hoặc email không
                    const isAnyFieldEmpty = participants.some(
                      (p: { name: string; email: string }) =>
                        !p || !p.name || !p.email,
                    );

                    if (isAnyFieldEmpty) {
                      return Promise.reject(
                        new Error(
                          "Please fill in the name and email for all participants.",
                        ),
                      );
                    }

                    // 3. Kiểm tra định dạng email hợp lệ
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const isAnyEmailInvalid = participants.some(
                      (p: { name: string; email: string }) =>
                        !emailRegex.test(p.email),
                    );

                    if (isAnyEmailInvalid) {
                      return Promise.reject(
                        new Error(
                          "There is an invalid email address. Please check again.",
                        ),
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  <div
                    style={{
                      background: "#f8f9fa",
                      padding: 16,
                      borderRadius: 16,
                      marginBottom: 16,
                    }}
                  >
                    {fields.map((field) => (
                      <Space
                        key={field.key}
                        align="baseline"
                        style={{
                          display: "flex",
                          width: "100%",
                          marginBottom: 12,
                        }}
                      >
                        <Form.Item
                          {...field}
                          name={[field.name, "name"]}
                          rules={[
                            { required: true, message: "Please enter a name" },
                          ]}
                          style={{ margin: 0, flex: 1 }}
                        >
                          <Input size="large" placeholder="Participant Name" />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, "email"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter an email",
                            },
                            { type: "email", message: "Email is not valid" },
                          ]}
                          style={{ margin: 0, flex: 2 }}
                        >
                          <Input size="large" placeholder="Participant Email" />
                        </Form.Item>
                        {fields.length > 3 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        )}
                      </Space>
                    ))}
                  </div>
                  <Form.Item>
                    <Button
                      type="dashed"
                      size="large"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                      style={{ width: "100%", borderRadius: 12 }}
                    >
                      Add Participant
                    </Button>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          <div
            style={{
              display: currentStep === 3 ? "block" : "none",
              animation: "fadeIn 0.5s",
            }}
          >
            <Form.Item
              label={<Text strong>Your Email (Event Organizer)</Text>}
              name="organizerEmail"
              rules={[
                { required: true, message: "Please leave your email" },
                { type: "email", message: "Email not valid" },
              ]}
            >
              <Input size="large" placeholder="de-thuong@example.com" />
            </Form.Item>

            <Divider style={{ borderColor: "#ffe4e1" }} />
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Title level={4} style={{ color: "#ff5a5f" }}>
                Review your information!
              </Title>
            </div>
            <ReviewSummary form={form} />
          </div>

          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              marginTop: 32,
            }}
          >
            {currentStep > 0 ? (
              <Button
                size="large"
                onClick={goBack}
                style={{ borderRadius: 100, padding: "0 32px" }}
              >
                Back
              </Button>
            ) : (
              <div />
            )}
            {currentStep < 3 && (
              <Button
                type="primary"
                size="large"
                onClick={goNext}
                style={{ borderRadius: 100, padding: "0 32px" }}
              >
                Continue
              </Button>
            )}
            {currentStep === 3 && (
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={submitting}
                icon={<SendOutlined />}
                style={{ borderRadius: 100, padding: "0 32px" }}
              >
                Shuffle & Send Invitations
              </Button>
            )}
          </Space>
        </Form>
      </Card>
    </div>
  );
}

function ReviewSummary({
  form,
}: {
  form: ReturnType<typeof Form.useForm<FormValues>>[0];
}) {
  const values = form.getFieldsValue(true) as Partial<FormValues>;
  const participants = values.participants || [];

  return (
    <List
      size="large"
      style={{
        background: "#fff9f9",
        borderRadius: 16,
        border: "1px solid #ffe4e1",
      }}
      dataSource={[
        { label: "Event Name", value: values.name || "—" },
        {
          label: "Deadline",
          value: values.deadline
            ? dayjs(values.deadline).format("HH:mm - DD/MM/YYYY")
            : "—",
        },
        {
          label: "Number of Participants",
          value: `${participants.length} participants`,
        },
      ]}
      renderItem={(item) => (
        <List.Item
          style={{ borderBottom: "1px solid #ffe4e1", padding: "16px 24px" }}
        >
          <Text type="secondary">{item.label}</Text>
          <Text strong style={{ fontSize: 16 }}>
            {item.value}
          </Text>
        </List.Item>
      )}
    />
  );
}
