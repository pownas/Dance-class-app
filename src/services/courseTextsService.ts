import { CourseText, CourseTextInput } from '../types';
import { buildUrl } from './apiConfigService';

/**
 * Fetches the full list of course texts from the backend.
 */
export async function getCourseTexts(): Promise<CourseText[]> {
  const url = await buildUrl('/course-texts');
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch course texts (${response.status})`);
  }
  return response.json() as Promise<CourseText[]>;
}

/**
 * Fetches a single course text by its ID.
 */
export async function getCourseText(id: string): Promise<CourseText> {
  const url = await buildUrl(`/course-texts/${encodeURIComponent(id)}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch course text ${id} (${response.status})`);
  }
  return response.json() as Promise<CourseText>;
}

/**
 * Creates a new course text and returns the created resource with its server-assigned ID.
 */
export async function createCourseText(courseText: CourseTextInput): Promise<CourseText> {
  const url = await buildUrl('/course-texts');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseText),
  });
  if (!response.ok) {
    throw new Error(`Failed to create course text (${response.status})`);
  }
  return response.json() as Promise<CourseText>;
}

/**
 * Replaces an existing course text with the supplied data.
 */
export async function updateCourseText(
  id: string,
  courseText: CourseTextInput,
): Promise<CourseText> {
  const url = await buildUrl(`/course-texts/${encodeURIComponent(id)}`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseText),
  });
  if (!response.ok) {
    throw new Error(`Failed to update course text ${id} (${response.status})`);
  }
  return response.json() as Promise<CourseText>;
}

/**
 * Deletes a course text by ID.
 */
export async function deleteCourseText(id: string): Promise<void> {
  const url = await buildUrl(`/course-texts/${encodeURIComponent(id)}`);
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`Failed to delete course text ${id} (${response.status})`);
  }
}
