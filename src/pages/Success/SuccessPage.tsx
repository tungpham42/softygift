import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Result, Button, Typography } from "antd";
import { CheckCircleOutlined, WarningOutlined } from "@ant-design/icons";
import type { CreateEventResult } from "../../types";

const { Text } = Typography;

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as CreateEventResult | undefined;

  if (!result) {
    return (
      <div className="page-container">
        <Card className="page-card">
          <Result
            status="info"
            title="Hmm, seems like there's no event here"
            extra={
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/")}
                style={{ borderRadius: 100 }}
              >
                Create New Event
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Card className="page-card" style={{ padding: "24px 0" }}>
        <Result
          status="success"
          title={
            <Text style={{ fontSize: 28, fontWeight: 700, color: "#ff5a5f" }}>
              Excellent! Invitations Sent Successfully{" "}
              <CheckCircleOutlined
                style={{ color: "#ff5a5f", marginLeft: 4 }}
              />
            </Text>
          }
          subTitle={
            <div style={{ fontSize: 16, marginTop: 16, color: "#666" }}>
              Secret invitations have been sent to{" "}
              <Text strong style={{ fontSize: 18, color: "#333" }}>
                {result.participantCount}
              </Text>{" "}
              participants.
              {result.failedInvites ? (
                <div
                  style={{
                    marginTop: 8,
                    padding: "8px 16px",
                    background: "#fff1f0",
                    borderRadius: 8,
                    display: "inline-block",
                  }}
                >
                  <WarningOutlined
                    style={{ color: "#faad14", marginRight: 6 }}
                  />
                  There are{" "}
                  <Text type="danger" strong>
                    {result.failedInvites}
                  </Text>{" "}
                  emails that failed to send. Please check your inbox!
                </div>
              ) : null}
            </div>
          }
          extra={
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/")}
              style={{
                borderRadius: 100,
                padding: "0 40px",
                marginTop: 24,
                fontWeight: 600,
              }}
            >
              Create New Event
            </Button>
          }
        />
      </Card>
    </div>
  );
}
