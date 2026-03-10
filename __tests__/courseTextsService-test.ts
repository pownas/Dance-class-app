import {
  getCourseTexts,
  getCourseText,
  createCourseText,
  updateCourseText,
  deleteCourseText,
} from '../src/services/courseTextsService';
import * as SecureStore from 'expo-secure-store';

beforeEach(() => {
  jest.clearAllMocks();
  (SecureStore as { _reset?: () => void })._reset?.();
});

const mockCourseText = {
  id: 'ct-1',
  title: 'WCS Grundsteg',
  content: '# WCS Grundsteg\n\n1. Starta med grundsteget\n',
  tags: ['wcs'],
};
const mockCourseTextInput = {
  title: 'WCS Grundsteg',
  content: '# WCS Grundsteg\n\n1. Starta med grundsteget\n',
  tags: ['wcs'],
};

// ---------------------------------------------------------------------------
// getCourseTexts
// ---------------------------------------------------------------------------
describe('getCourseTexts', () => {
  it('GETs /course-texts and returns array', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [mockCourseText],
    }) as unknown as typeof fetch;

    const texts = await getCourseTexts();
    expect(texts).toEqual([mockCourseText]);
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toMatch(/\/course-texts$/);
  });

  it('throws on non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    await expect(getCourseTexts()).rejects.toThrow('Failed to fetch course texts (500)');
  });
});

// ---------------------------------------------------------------------------
// getCourseText
// ---------------------------------------------------------------------------
describe('getCourseText', () => {
  it('GETs /course-texts/:id and returns the item', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCourseText,
    }) as unknown as typeof fetch;

    const text = await getCourseText('ct-1');
    expect(text).toEqual(mockCourseText);
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
    expect(url).toMatch(/\/course-texts\/ct-1$/);
  });

  it('throws on not-found response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;
    await expect(getCourseText('missing')).rejects.toThrow('Failed to fetch course text missing (404)');
  });
});

// ---------------------------------------------------------------------------
// createCourseText
// ---------------------------------------------------------------------------
describe('createCourseText', () => {
  it('POSTs to /course-texts with correct payload and returns created item', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...mockCourseTextInput, id: 'ct-99' }),
    }) as unknown as typeof fetch;

    const text = await createCourseText(mockCourseTextInput);
    expect(text.id).toBe('ct-99');
    expect(text.title).toBe(mockCourseTextInput.title);

    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/course-texts$/);
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body as string)).toMatchObject(mockCourseTextInput);
  });

  it('throws on bad-request response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400 }) as unknown as typeof fetch;
    await expect(createCourseText(mockCourseTextInput)).rejects.toThrow('Failed to create course text (400)');
  });
});

// ---------------------------------------------------------------------------
// updateCourseText
// ---------------------------------------------------------------------------
describe('updateCourseText', () => {
  it('PUTs to /course-texts/:id with correct payload and returns updated item', async () => {
    const updated = { ...mockCourseText, content: '# Updated\n' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => updated,
    }) as unknown as typeof fetch;

    const text = await updateCourseText('ct-1', { ...mockCourseTextInput, content: '# Updated\n' });
    expect(text.content).toBe('# Updated\n');

    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/course-texts\/ct-1$/);
    expect(opts.method).toBe('PUT');
  });

  it('throws on not-found response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;
    await expect(updateCourseText('ghost', mockCourseTextInput)).rejects.toThrow('Failed to update course text ghost (404)');
  });
});

// ---------------------------------------------------------------------------
// deleteCourseText
// ---------------------------------------------------------------------------
describe('deleteCourseText', () => {
  it('DELETEs /course-texts/:id', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;

    await deleteCourseText('ct-1');

    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/course-texts\/ct-1$/);
    expect(opts.method).toBe('DELETE');
  });

  it('throws on not-found response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;
    await expect(deleteCourseText('ghost')).rejects.toThrow('Failed to delete course text ghost (404)');
  });
});
