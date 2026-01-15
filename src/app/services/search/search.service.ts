import { Injectable } from '@angular/core';
import { Employee } from '../../Employee';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor() { }

  filterEmployees(employees: Employee[], searchTerm: string): Employee[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return employees;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    return employees.filter(emp => {
      const firstName = emp.firstName?.toLowerCase() || '';
      const lastName = emp.lastName?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`;
      const fullNameReverse = `${lastName} ${firstName}`;
      const city = emp.city?.toLowerCase() || '';
      const qualifications = emp.skillSet?.map(skill => skill.skill.toLowerCase()).join(' ') || '';

      return fullName.includes(searchLower) ||
        fullNameReverse.includes(searchLower) ||
        city.includes(searchLower) ||
        qualifications.includes(searchLower);
    });
  }
}

