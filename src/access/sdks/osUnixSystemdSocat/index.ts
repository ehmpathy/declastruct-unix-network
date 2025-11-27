import { getOsUnixSystemdSocatServices } from './dop.getOsUnixSystemdSocatServices';
import { setOsUnixSystemdSocatService } from './dop.setOsUnixSystemdSocatService';

export { OsUnixSystemdSocatService } from './dobj.OsUnixSystemdSocatService';

/**
 * .what = SDK for managing systemd socat services
 * .why = provides structured operations on socat port forwarding services
 */
export const osUnixSystemdSocatSdk = {
  getOsUnixSystemdSocatServices,
  setOsUnixSystemdSocatService,
};
