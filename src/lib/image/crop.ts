import type { Area } from "react-easy-crop";

function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  };
}

export async function getCroppedImage(imageSrc: string, pixelCrop: Area, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("浏览器不支持 Canvas 裁剪");
  }

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  context.translate(bBoxWidth / 2, bBoxHeight / 2);
  context.rotate(rotRad);
  context.translate(-image.width / 2, -image.height / 2);
  context.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedContext = croppedCanvas.getContext("2d");

  if (!croppedContext) {
    throw new Error("浏览器不支持 Canvas 裁剪");
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedContext.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return croppedCanvas.toDataURL("image/png");
}
