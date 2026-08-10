import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  Typography,
  Spin,
  Result,
  Divider,
  Form,
  Input,
  Button,
  Statistic,
  message,
  Tag,
} from "antd";
import {
  HeartFilled,
  SmileOutlined,
  LockFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { getAssignment, updateWishlist } from "../../services/api";
import type { AssignmentResponse } from "../../types";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Countdown } = Statistic;

export default function GiftRequestPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AssignmentResponse | null>(null);
  const [wishlist, setWishlist] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(
        "Oops! It seems the link is missing information. Please try clicking again from the email.",
      );
      setLoading(false);
      return;
    }
    getAssignment(token)
      .then((res) => {
        setData(res);
        setWishlist(res.me.wishlist || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const deadlineTime = data ? new Date(data.deadline).getTime() : 0;
  const isExpired = data ? Date.now() > deadlineTime : false;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateWishlist(token, wishlist);
      message.success({
        content: (
          <span>
            Successfully saved your wish!{" "}
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
          </span>
        ),
        duration: 3,
      });
    } catch (err) {
      message.error(
        err instanceof Error ? err.message : "Failed to save, please try again",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ alignItems: "center" }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <Card className="page-card">
          <Result
            status="error"
            title="Cannot open invitation"
            subTitle={error || "An error occurred"}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Card className="page-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={2} style={{ color: "#ff5a5f", margin: 0 }}>
            {data.eventName}
          </Title>
          <Paragraph
            type="secondary"
            style={{ whiteSpace: "pre-wrap", marginTop: 12, fontSize: 16 }}
          >
            {data.rules}
          </Paragraph>
        </div>

        <div
          style={{
            background: "#fff0f0",
            borderRadius: 16,
            padding: "16px 24px",
            textAlign: "center",
          }}
        >
          {!isExpired ? (
            <Countdown
              title={
                <Text strong style={{ color: "#ff5a5f" }}>
                  Time remaining to submit your wish
                </Text>
              }
              value={deadlineTime}
              format="D Days HH:mm:ss"
            />
          ) : (
            <Tag color="default" style={{ padding: "8px 16px", fontSize: 14 }}>
              Time's up for editing your wish{" "}
              <ClockCircleOutlined style={{ marginLeft: 4 }} />
            </Tag>
          )}
        </div>

        <Divider style={{ borderColor: "#ffe4e1" }} />

        <div style={{ marginBottom: 32 }}>
          <Title
            level={4}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <HeartFilled style={{ color: "#ff5a5f" }} /> You are the secret
            santa of...
          </Title>
          {data.recipient ? (
            <Card
              size="default"
              bordered={false}
              style={{
                background:
                  "linear-gradient(120deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
                color: "#fff",
                borderRadius: 20,
                boxShadow: "0 10px 20px rgba(255, 154, 158, 0.2)",
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#fff",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                {data.recipient.name}
              </Text>
              <div
                style={{
                  background: "rgba(255,160,160,0.2)",
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                <Text strong style={{ color: "#fff" }}>
                  Gift Suggestions (Wishlist):
                </Text>
                <Paragraph
                  style={{
                    marginTop: 8,
                    marginBottom: 0,
                    whiteSpace: "pre-wrap",
                    color: "#fff",
                  }}
                >
                  {data.recipient.wishlist ? (
                    data.recipient.wishlist
                  ) : (
                    <>
                      This person wants to keep it a secret or hasn't had a
                      chance to write their wishlist yet <SmileOutlined />
                    </>
                  )}
                </Paragraph>
              </div>
            </Card>
          ) : (
            <Text type="secondary">No recipient information available.</Text>
          )}
        </div>

        <Title
          level={4}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <LockFilled style={{ color: "#ffb8b8" }} /> Write Your Wish
        </Title>
        <Paragraph type="secondary">
          What would you like to be gifted? Please write it down here so your
          secret santa can easily choose a gift for you!
        </Paragraph>
        <Form.Item>
          <TextArea
            size="large"
            rows={5}
            value={wishlist}
            onChange={(e) => setWishlist(e.target.value)}
            placeholder="E.g.: I like scented candles with a cinnamon scent, funny socks, or a good book..."
            maxLength={2000}
            disabled={isExpired}
            style={{ borderRadius: 12, backgroundColor: "#fdfdfd" }}
          />
        </Form.Item>
        <Button
          type="primary"
          size="large"
          block
          onClick={handleSave}
          loading={saving}
          disabled={isExpired}
          icon={<StarOutlined />}
          style={{ borderRadius: 12, fontWeight: 600 }}
        >
          Save Wish
        </Button>
      </Card>
    </div>
  );
}
