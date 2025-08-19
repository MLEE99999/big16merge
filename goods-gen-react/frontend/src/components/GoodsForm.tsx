import React, { useState } from "react";
import axios from "axios";
import NavBar from "./NavBar.tsx";

const aspectRatios = [
  "match_input_image", "1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3",
  "4:5", "5:4", "21:9", "9:21", "2:1", "1:2"
];

const containerStyle: React.CSSProperties = {
  fontFamily: "'Nanum Gothic', sans-serif",
  backgroundColor: "#ffffff",
  minHeight: "100vh",
  margin: 0,
  padding: 0,
  overflowX: "hidden",
};

// ✅ [수정] flexWrap: 'wrap'을 추가하여 화면이 좁을 때 컬럼이 세로로 쌓이도록 합니다.
const mainContentStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "40px",
  maxWidth: "1440px",
  margin: "0 auto",
  padding: "20px",
  alignItems: "flex-start",
  boxSizing: "border-box",
};

const formColumnStyle: React.CSSProperties = {
  flex: "1 1 400px", // ✅ [수정] flex 아이템이 유연하게 줄어들 수 있도록 변경
  minWidth: "320px",  // ✅ [수정] 최소 너비를 줄여 작은 화면에 대응
  textAlign: "left",
};

const outputColumnStyle: React.CSSProperties = {
  flex: "1 1 400px", // ✅ [수정] flex 아이템이 유연하게 줄어들 수 있도록 변경
  minWidth: "320px",  // ✅ [수정] 최소 너비를 줄여 작은 화면에 대응
  textAlign: "left",
  paddingTop: "20px", // ✅ [수정] 모바일에서 세로로 쌓일 때를 대비해 상단 패딩 조정
};

const fileInputBoxStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  marginBottom: '16px',
  marginTop: '8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box', // ✅ [추가] 패딩이 너비에 포함되도록 설정
};

const imagePreviewFrameStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "10px",
  marginTop: "8px",
  marginBottom: "24px",
  backgroundColor: "#f9f9f9",
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: "300px",
  width: "100%",
  color: "#aaa",
  fontSize: "14px",
  boxSizing: 'border-box',
};

const promptBoxStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px',
  marginBottom: '16px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  minHeight: '40px',
  resize: 'vertical',
  boxSizing: 'border-box',
};

const generateButtonStyle: React.CSSProperties = {
  width: '100%',
  height: '56px',
  padding: '14px',
  fontSize: '18px',
  fontWeight: 'bold',
  backgroundColor: '#09AA5C',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '20px',
};

const downloadButtonStyle: React.CSSProperties = {
  width: '100%',
  height: '56px',
  padding: '14px',
  fontSize: '18px',
  fontWeight: 'bold',
  backgroundColor: '#09AA5C',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '20px',
};

export default function GoodsForm() {
  const [prompt, setPrompt] = useState("Draw a realistic version of a short-sleeve white color T-shirt with this pig character printed on it.");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [seed, setSeed] = useState<number>(11);
  const [isRandomSeed, setIsRandomSeed] = useState(false);
  const [safetyTolerance, setSafetyTolerance] = useState(2);
  const [outputUrl, setOutputUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert("캐릭터 이미지를 업로드하세요.");
      return;
    }

    const finalSeed = isRandomSeed ? Math.floor(Math.random() * 99999999) : seed;
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("input_image", image);
    formData.append("aspect_ratio", aspectRatio);
    formData.append("seed", finalSeed.toString());
    formData.append("safety_tolerance", safetyTolerance.toString());

    setLoading(true);
    setOutputUrl("");

    try {
      // ✅ [핵심 수정] 1. 응답 타입을 'blob'으로 지정하여 이미지 데이터를 직접 받습니다.
      const response = await axios.post("/api/goods-gen/generate", formData, {
        responseType: 'blob',
      });

      // ✅ [핵심 수정] 2. 받은 blob 데이터로 브라우저에서 사용할 수 있는 임시 URL을 생성합니다.
      const imageUrl = URL.createObjectURL(response.data);
      setOutputUrl(imageUrl);

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "이미지 생성에 실패했습니다.";
      alert(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ [수정] 다운로드 핸들러를 더 간단하게 변경
  const handleDownload = () => {
    if (!outputUrl) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    link.setAttribute("download", "generated-goods.png");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  return (
    <div style={containerStyle}>
      <div style={mainContentStyle}>
        <div style={formColumnStyle}>
          <h2 style={{ marginBottom: "30px" }}>웹툰 캐릭터 굿즈 초안 생성</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="prompt" style={{ fontWeight: "bold", display: 'block', marginBottom: '6px' }}>
              프롬프트를 영어로 입력하세요
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={promptBoxStyle}
            />

            <label htmlFor="imageUpload" style={{ fontWeight: "bold", display: 'block', marginBottom: '8px' }}>
              웹툰 캐릭터 이미지를 넣어주세요
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={fileInputBoxStyle}
            />

            <div style={imagePreviewFrameStyle}>
              {preview ? (
                <img src={preview} alt="Preview" style={{ maxWidth: "100%", maxHeight: "300px", height: "auto" }} />
              ) : (
                <p>이미지 업로드 시 여기에 표시됩니다.</p>
              )}
            </div>

            <label htmlFor="aspectRatio" style={{ fontWeight: "bold", marginBottom: '16px' }}>이미지 비율</label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              style={fileInputBoxStyle}
            >
              {aspectRatios.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <label style={{ fontWeight: "bold", marginTop: "20px" }}>Seed 설정</label>
            <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
              <div>
                <input type="radio" id="fixedSeed" name="seedMode" checked={!isRandomSeed} onChange={() => setIsRandomSeed(false)} />
                <label htmlFor="fixedSeed" style={{ marginLeft: "4px",}}>고정값 사용</label>
              </div>
              <div>
                <input type="radio" id="randomSeed" name="seedMode" checked={isRandomSeed} onChange={() => setIsRandomSeed(true)} />
                <label htmlFor="randomSeed" style={{ marginLeft: "4px",}}>랜덤하게 생성</label>
              </div>
            </div>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              disabled={isRandomSeed}
              style={fileInputBoxStyle}
            />

            <label htmlFor="safetyTolerance" style={{ fontWeight: "bold",}}>Safety Tolerance(프롬프트 적용): {safetyTolerance}</label>
            <input
              id="safetyTolerance"
              type="range"
              min={0}
              max={2}
              step={1}
              value={safetyTolerance}
              onChange={(e) => setSafetyTolerance(Number(e.target.value))}
              style={{ width: '100%', marginTop: '8px', marginBottom: '16px' }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                ...generateButtonStyle,
                backgroundColor: loading ? "#ccc" : "#09AA5C"
              }}
            >
              {loading ? "생성 중..." : "굿즈 초안 생성✨"}
            </button>
          </form>
        </div>

        <div style={outputColumnStyle}>
          <h3 style={{ marginBottom: "10px" }}>출력 이미지</h3>
          <div style={imagePreviewFrameStyle}>
            {loading && <p>이미지를 생성 중입니다...</p>}
            {!loading && outputUrl ? (
              <img src={outputUrl} alt="Generated" style={{ maxWidth: "100%", maxHeight: "400px", height: "auto" }} />
            ) : (
              !loading && <p style={{ color: "#aaa" }}>생성된 이미지가 여기에 표시됩니다.</p>
            )}
          </div>
          {outputUrl && !loading && (
            <button onClick={handleDownload} style={downloadButtonStyle}>
              📥 이미지 다운로드
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
