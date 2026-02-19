let connectedDevice = null;

export const setConnectedDevice = (device) => {
  connectedDevice = device;
};

export const getConnectedDevice = () => {
  return connectedDevice;
};

export const clearConnectedDevice = () => {
  connectedDevice = null;
};
