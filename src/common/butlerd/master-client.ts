import { Instance } from "butlerd";
import { butlerDbPath } from "common/util/paths";
import urls from "common/constants/urls";
import ospath from "path";
import { userAgent } from "common/constants/useragent";
import { RootState } from "common/types";
import env from "common/env";

export async function makeButlerInstance(rs: RootState): Promise<Instance> {
  const butlerPkg = rs.broth.packages["butler"];
  if (!butlerPkg) {
    throw new Error(
      `Cannot make butler instance: package 'butler' not registered`
    );
  }

  const versionPrefix = butlerPkg.versionPrefix;
  if (!versionPrefix) {
    throw new Error(`Cannot make butler instance: no version prefix`);
  }

  return makeButlerInstanceWithPrefix(versionPrefix);
}

export async function makeButlerInstanceWithPrefix(
  versionPrefix: string
): Promise<Instance> {
  let args = [
    "--dbpath",
    butlerDbPath(),
    "--address",
    urls.itchio,
    "--user-agent",
    userAgent(),
    "--destiny-pid",
    `${process.pid}`,
  ];

  if (env.development) {
    args = [...args, "--log"];
  }

  return new Instance({
    butlerExecutable: ospath.join(versionPrefix, "butler"),
    args,
  });
}
