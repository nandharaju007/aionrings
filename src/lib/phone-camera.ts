type DeviceIdentity = {
  userAgent: string;
  userAgentData?: { mobile: boolean };
};

// Device identity, not window width: a narrow laptop window is still a laptop.
export function isPhoneDevice(device: DeviceIdentity): boolean {
  if (/iPad|Tablet|Kindle|Silk/i.test(device.userAgent)) return false;
  return device.userAgentData?.mobile ?? /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(device.userAgent);
}