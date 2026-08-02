import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fileToResizedDataUrl, videoFrameToResizedDataUrl } from './image';

let mockDims = { width: 800, height: 600 };
let mockShouldError = false;

class MockImage {
  constructor() {
    this.width = mockDims.width;
    this.height = mockDims.height;
    this.onload = null;
    this.onerror = null;
  }
  set src(value) {
    this._src = value;
    queueMicrotask(() => {
      if (mockShouldError) this.onerror?.(new Error('load failed'));
      else this.onload?.();
    });
  }
  get src() {
    return this._src;
  }
}

beforeEach(() => {
  mockDims = { width: 800, height: 600 };
  mockShouldError = false;
  vi.stubGlobal('Image', MockImage);
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn(),
  });
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage: vi.fn() }));
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,mock');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function makeFile() {
  return new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
}

describe('fileToResizedDataUrl', () => {
  it('resolves with the canvas-generated data URL', async () => {
    const result = await fileToResizedDataUrl(makeFile());
    expect(result).toBe('data:image/jpeg;base64,mock');
  });

  it('leaves dimensions unchanged when already within maxDim', async () => {
    mockDims = { width: 800, height: 600 };
    const drawImage = vi.fn();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage }));

    await fileToResizedDataUrl(makeFile(), { maxDim: 1200 });

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 800, 600);
  });

  it('scales down images larger than maxDim while preserving aspect ratio', async () => {
    mockDims = { width: 3000, height: 1500 };
    const drawImage = vi.fn();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage }));

    await fileToResizedDataUrl(makeFile(), { maxDim: 1200 });

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1200, 600);
  });

  it('scales down a portrait image using the taller dimension', async () => {
    mockDims = { width: 900, height: 3600 };
    const drawImage = vi.fn();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage }));

    await fileToResizedDataUrl(makeFile(), { maxDim: 1200 });

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 300, 1200);
  });

  it('passes the quality option through to the JPEG export', async () => {
    const toDataURL = vi.fn(() => 'data:image/jpeg;base64,mock');
    HTMLCanvasElement.prototype.toDataURL = toDataURL;

    await fileToResizedDataUrl(makeFile(), { quality: 0.5 });

    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.5);
  });

  it('revokes the temporary object URL after the image loads', async () => {
    await fileToResizedDataUrl(makeFile());
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('rejects when the image fails to load', async () => {
    mockShouldError = true;
    await expect(fileToResizedDataUrl(makeFile())).rejects.toThrow('Failed to load image');
  });
});

describe('videoFrameToResizedDataUrl', () => {
  function makeVideo(videoWidth, videoHeight) {
    return { videoWidth, videoHeight };
  }

  it('resolves synchronously with the canvas-generated data URL', () => {
    const result = videoFrameToResizedDataUrl(makeVideo(800, 600));
    expect(result).toBe('data:image/jpeg;base64,mock');
  });

  it('leaves dimensions unchanged when already within maxDim', () => {
    const drawImage = vi.fn();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage }));

    videoFrameToResizedDataUrl(makeVideo(800, 600), { maxDim: 1200 });

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 800, 600);
  });

  it('scales down a video frame larger than maxDim while preserving aspect ratio', () => {
    const drawImage = vi.fn();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({ drawImage }));

    videoFrameToResizedDataUrl(makeVideo(3000, 1500), { maxDim: 1200 });

    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1200, 600);
  });

  it('passes the quality option through to the JPEG export', () => {
    const toDataURL = vi.fn(() => 'data:image/jpeg;base64,mock');
    HTMLCanvasElement.prototype.toDataURL = toDataURL;

    videoFrameToResizedDataUrl(makeVideo(800, 600), { quality: 0.5 });

    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.5);
  });
});
