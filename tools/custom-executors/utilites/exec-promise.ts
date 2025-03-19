import { exec } from "child_process"

export function execPromise(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const response = exec(cmd, (err, data) => {
      response.removeAllListeners();

      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });

    response.stdout!.on('data', data => {
      console.log(data);
    });

    response.stderr!.on('data', data => {
      console.error(data);
    });
  });
}