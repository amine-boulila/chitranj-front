// pages/GoogleCallBack.tsx
import { GetServerSideProps } from "next";
import React, { useEffect } from "react";

interface GoogleCallBackProps {
  error?: string;
  tokens?: any;
}

const GoogleCallBack: React.FC<GoogleCallBackProps> = ({ error, tokens }) => {
  useEffect(() => {
    const sendToBackend = async () => {
      if (tokens?.id_token) {
        try {
          const response = await fetch("http://localhost:5000/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken: tokens.id_token }),
            credentials: "include", // 👈 ADD THIS LINE
          });

          const text = await response.text();
          try {
            const json = JSON.parse(text);
            console.log("Backend JSON response:", json);
          } catch (parseErr) {
            console.error("Failed to parse JSON. Raw response:", text);
          }

          window.location.href = "http://localhost:3000";
        } catch (err) {
          console.error("Request failed:", err);
        }
      }
    };

    sendToBackend();
  }, [tokens]);

  if (error) return <div>Auth error: {error}</div>;
  return <div>Logging you in...</div>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { code } = context.query;
  if (!code) {
    return { props: { error: "No code provided in query parameters." } };
  }

  const clientId =
    "69383371855-o318d1fb0rtkfhlgfeo17r648slb8pkm.apps.googleusercontent.com";
  const clientSecret = "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"; // 🔥 Replace this with your actual secret
  const redirectUri = "http://localhost:3000/GoogleCallBack";

  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams();
  params.append("code", code.toString());
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("redirect_uri", redirectUri);
  params.append("grant_type", "authorization_code");

  try {
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return { props: { error: `Token exchange failed: ${errorText}` } };
    }

    const tokens = await tokenResponse.json();
    return { props: { tokens } };
  } catch (err: any) {
    return { props: { error: err.message } };
  }
};

export default GoogleCallBack;
