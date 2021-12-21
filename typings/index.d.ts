interface Config {
  format: "HH:mm" | "HH:mm:ss";
  workingTime: string;
  breakingTime: string;
}

type Format = "ss" | "mm" | "mm:ss" | "HH:mm" | "HH:mm:ss";

interface String {
  /*padStart(2, "0");*/
  p2: () => string;
}
