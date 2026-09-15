export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST 요청만 가능합니다."
    });
  }

  try {
    const files = req.body?.openaiFileIdRefs;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: "전송할 이미지가 없습니다."
      });
    }

    const file = files[0];
    const imageUrl = file.download_link;

    if (!imageUrl || !imageUrl.startsWith("https://")) {
      return res.status(400).json({
        error: "이미지 다운로드 주소를 찾지 못했습니다."
      });
    }

    const formData = new FormData();

    formData.append("file", imageUrl);
    formData.append(
      "upload_preset",
      process.env.CLOUDINARY_UPLOAD_PRESET
    );

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const result = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
      return res.status(500).json({
        error: "Cloudinary 업로드 실패",
        detail: result
      });
    }

    return res.status(200).json({
      success: true,
      image_url: result.secure_url
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
