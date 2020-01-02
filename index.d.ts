export default class SharedWebSocket {
  constructor(url: string);
  onmessage: (e: { type: string; data: any }) => void;
  onopen: (e: any) => void;
  onerror: (e: any) => void;
  onclose: (e: any) => void;

  send(data: any): void;
  close(code: number): void;
}
