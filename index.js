import fs from "fs";
import mime from "mime";
import path from "path";
import sharp from "sharp";
import chalk from "chalk";

const targetDir = "./source";
const outputDir = "./output";
const options = {
  // type: "webp",
  // width: 350,
  quality: 75,
};

const MIME_TYPES = {
  "image/png": "png",
  "image/gif": "gif",
  "image/jpeg": "jpeg",
  "image/webp": "webp",
};

const date = new Date().toLocaleDateString().replace(/\//g, "-");

function getFileType(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return "文件不存在";
    }
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return "这是一个目录";
    } else if (stats.isFile()) {
      const ext = path.extname(filePath);
      const mimeType = mime.getType(filePath);
      return {
        ext: ext,
        mime: mimeType,
      };
    }
  } catch (error) {
    return "error: " + error.message;
  }
}

function getCompressType(fileType) {
  return MIME_TYPES[fileType.mime] || "不支持的文件类型";
}

function compress() {
  fs.readdir(targetDir, { recursive: true }, (err, files) => {
    if (err) {
      console.error(chalk.red("读取目录时出错:"), err);
      return;
    }
    if (!files || files.length === 0) {
      console.log(chalk.yellow("目录为空"));
      return;
    }
    files.forEach((file) => {
      const filePath = path.join(targetDir, file);
      const fileType = getFileType(filePath);
      const compressType = getCompressType(fileType);
      console.log(chalk.blue("文件类型:"), fileType);
      console.log(chalk.blue("压缩类型:"), compressType);
      if (typeof fileType === "object" && compressType !== "不支持的文件类型") {
        const fileDir = path.join(outputDir, date, path.dirname(file));
        const fileName = path.join(fileDir, path.basename(file));
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        const image = sharp(filePath, { animated: true });
        if (options.width) {
          image.resize({ width: options.width });
        }
        // 返回的文件类型
        const outType = options.type || compressType;
        // 输出文件路径、名称
        const outputFile = options.type
          ? fileName.replace(fileType.ext, "." + options.type)
          : fileName;
        image[outType]({
          quality: options.quality,
        }).toFile(outputFile, (err) => {
          if (err) {
            console.error(chalk.red("处理文件时出错:"), fileName);
          } else {
            console.log(chalk.green("文件处理完成:"), fileName);
          }
        });
      }
    });
  });
}

compress();
