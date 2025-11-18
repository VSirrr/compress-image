import fs from "fs";
import mime from "mime";
import path from "path";
import sharp from "sharp";
import chalk from "chalk";

const targetDir = "./source";
const outputDir = "./output";
const options = {
  // width: 192,
  quality: 75,
};

async function checkDir() {
  return new Promise((resolve, reject) => {
    const isExist = fs.existsSync(outputDir);
    if (!isExist) {
      fs.mkdir(outputDir, (err) => {
        if (err) {
          console.error(chalk.red("创建目录时出错:"), err);
          reject(err);
        } else {
          console.log(chalk.green("目录创建成功"));
          resolve();
        }
      });
    } else {
      fs.rm(outputDir, { recursive: true }, (err) => {
        if (err) {
          console.error(chalk.red("删除目录时出错:"), err);
          reject(err);
        } else {
          console.log(chalk.green("目录删除成功"));
          resolve();
        }
      });
    }
  });
}

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
  if (fileType.mime === "image/jpeg") {
    return "jpeg";
  } else if (fileType.mime === "image/png") {
    return "png";
  } else if (fileType.mime === "image/webp") {
    return "webp";
  } else {
    return "不支持的文件类型";
  }
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
      console.log(chalk.blue("文件类型:"), fileType);
      if (
        typeof fileType === "object" &&
        getCompressType(fileType) !== "不支持的文件类型"
      ) {
        const fileDir = path.join(
          outputDir,
          Math.random().toString(36).substring(2)
        );
        const fileName = path.join(fileDir, path.basename(file));
        fs.mkdirSync(fileDir, { recursive: true });
        const instance = sharp(filePath);
        if (options.width) {
          instance.resize({ width: options.width });
        }
        instance[getCompressType(fileType)]({
          quality: options.quality,
        }).toFile(fileName, (err) => {
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

async function bootstrap() {
  await checkDir();
  compress();
}

bootstrap();
