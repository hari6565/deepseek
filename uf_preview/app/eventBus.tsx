import mitt from 'mitt';

type Events = {
  triggerButton: string;
  closeModal: string;
  buttonReady: string;
  [key: string]: any;
};

export const eventBus = mitt<Events>();