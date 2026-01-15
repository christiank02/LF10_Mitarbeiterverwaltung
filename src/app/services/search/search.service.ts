import { Injectable } from '@angular/core';
import { Employee } from '../../Employee';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor() { }

  /**
   * Filters employees based on a search term.
   *
   * Searches in the following fields:
   * - First name
   * - Last name
   * - Full name (First Last)
   * - Reversed name (Last First)
   * - City
   * - Qualifications (all skills)
   *
   * @param employees - Array of employees to filter
   * @param searchTerm - Search term (case-insensitive)
   * @returns Filtered array of employees matching the search term
   *
   * @example
   * ```typescript
   * const filtered = searchService.filterEmployees(employees, 'Berlin');
   * // Returns all employees from Berlin
   * ```
   */
  filterEmployees(employees: Employee[], searchTerm: string): Employee[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return employees;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    return employees.filter(emp => {
      // Name search
      const firstName = emp.firstName?.toLowerCase() || '';
      const lastName = emp.lastName?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`;
      const fullNameReverse = `${lastName} ${firstName}`;

      // City search
      const city = emp.city?.toLowerCase() || '';

      // Qualifications search
      const qualifications = emp.skillSet?.map(skill => skill.skill.toLowerCase()).join(' ') || '';

      return fullName.includes(searchLower) ||
        fullNameReverse.includes(searchLower) ||
        city.includes(searchLower) ||
        qualifications.includes(searchLower);
    });
  }

  /**
   * Checks if a single employee matches the search term.
   *
   * @param employee - The employee to check
   * @param searchTerm - Search term (case-insensitive)
   * @returns `true` if the employee matches the search term, `false` otherwise
   *
   * @example
   * ```typescript
   * if (searchService.matchesSearch(employee, 'Java')) {
   *   console.log('Employee has Java qualification');
   * }
   * ```
   */
  matchesSearch(employee: Employee, searchTerm: string): boolean {
    if (!searchTerm || searchTerm.trim() === '') {
      return true;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    const firstName = employee.firstName?.toLowerCase() || '';
    const lastName = employee.lastName?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`;
    const fullNameReverse = `${lastName} ${firstName}`;
    const city = employee.city?.toLowerCase() || '';
    const qualifications = employee.skillSet?.map(skill => skill.skill.toLowerCase()).join(' ') || '';

    return fullName.includes(searchLower) ||
      fullNameReverse.includes(searchLower) ||
      city.includes(searchLower) ||
      qualifications.includes(searchLower);
  }

  /**
   * Highlights the search term in a text using `<mark>` tags.
   *
   * Note: This method is provided for future use.
   *
   * @param text - The original text
   * @param searchTerm - The search term to highlight
   * @returns Text with the search term wrapped in `<mark>` tags
   *
   * @example
   * ```typescript
   * const highlighted = searchService.highlightSearchTerm('Max Mustermann', 'Max');
   * // Result: '<mark>Max</mark> Mustermann'
   * ```
   */
  highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm || !text) {
      return text;
    }

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

