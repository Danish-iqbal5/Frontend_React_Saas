// Small helper to confirm destructive or important actions
export const confirmAction = (message) => {
  return window.confirm(message);
};

export default { confirmAction };


