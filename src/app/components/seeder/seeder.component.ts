import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { firstValueFrom } from 'rxjs';

interface Qualification { id?: number; skill: string }

@Component({
  selector: 'app-seeder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seeder.component.html',
  styleUrl: './seeder.component.css'
})
export class SeederComponent {
  baseUrl = 'http://localhost:8089';
  isRunning = false;
  logs: string[] = [];
  createdEmployees = 0;
  createdQualifications = 0;


  maxEmployees = 10000;
  maxQualifications = 20;
  employeeCount = 10;
  qualificationCount = 10;

  private generatedQualificationNames: string[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  async seed() {
    this.isRunning = true;
    this.logs = [];
    this.createdEmployees = 0;
    this.createdQualifications = 0;

    try {
      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.authService.getAccessToken()}`);

      // Normalize requested counts
      const qCount = Math.max(1, Math.min(this.qualificationCount, this.maxQualifications));
      const eCount = Math.max(1, Math.min(this.employeeCount, this.maxEmployees));

      // 1) Generate and create qualifications (ignore duplicates)
      this.generatedQualificationNames = this.generateQualificationNames(qCount);
      for (const skill of this.generatedQualificationNames) {
        try {
          await firstValueFrom(
            this.http.post(`${this.baseUrl}/qualifications`, { skill }, { headers })
          );
          this.createdQualifications += 1;
          this.logs.push(`Added qualification: ${skill}`);
        } catch (err: any) {
          this.logs.push(`Skipped qualification '${skill}': ${err?.message ?? 'exists or error'}`);
        }
      }

      // 2) Fetch all qualifications and build map
      const qualifications = await firstValueFrom(
        this.http.get<Qualification[]>(`${this.baseUrl}/qualifications`, { headers })
      );
      const qualMap = new Map<string, number>();
      qualifications.forEach(q => {
        if (q.skill && typeof q.id === 'number') {
          qualMap.set(q.skill, q.id);
        }
      });
      if (qualMap.size === 0) throw new Error('No qualifications available');

      // Helper to pick random IDs
      const pickRandomSkillIds = (min = 2, max = 5) => {
        const count = Math.floor(Math.random() * (max - min)) + min;
        const names = Array.from(qualMap.keys());
        const chosen: string[] = [];
        for (let i = 0; i < count && names.length > 0; i++) {
          const idx = Math.floor(Math.random() * names.length);
          chosen.push(names.splice(idx, 1)[0]);
        }
        const ids = chosen
          .map(name => qualMap.get(name))
          .filter((id): id is number => typeof id === 'number');
        // ensure uniqueness
        return Array.from(new Set(ids));
      };

      // 3) Generate and create employees with random skill sets
      const employees = this.generateEmployees(eCount);
      for (const e of employees) {
        const skillSet = pickRandomSkillIds(2, 5);
        const body = {
          lastName: e.lastName,
          firstName: e.firstName,
          street: e.street,
          postcode: e.postcode,
          city: e.city,
          phone: e.phone,
          skillSet
        };
        try {
          await firstValueFrom(
            this.http.post(`${this.baseUrl}/employees`, body, { headers })
          );
          this.createdEmployees += 1;
          this.logs.push(`Added employee: ${e.firstName} ${e.lastName} (${skillSet.length} skills)`);
        } catch (err: any) {
          this.logs.push(`Failed employee '${e.firstName} ${e.lastName}': ${err?.message ?? 'error'}`);
        }
      }

      this.logs.push(`Done. Created ${this.createdQualifications} qualifications and ${this.createdEmployees} employees.`);
    } catch (error: any) {
      this.logs.push(`Seeding failed: ${error?.message ?? error}`);
    } finally {
      this.isRunning = false;
    }
  }

  private generateQualificationNames(count: number): string[] {
    const base = [
      'Java','Python','C#','C++','Go','Rust','SQL','NoSQL','Cloud','AWS','Azure','GCP',
      'Docker','Kubernetes','DevOps','CI/CD','Security','Testing','QA','UI/UX','Frontend','Backend',
      'Microservices','Data Science','Machine Learning','Project Management'
    ];
    const unique = new Set<string>();
    const names = [...base];
    while (unique.size < count) {
      if (names.length === 0) {
        // create numbered variants to keep uniqueness
        const idx = unique.size + 1;
        unique.add(`Skill ${idx}`);
      } else {
        const i = Math.floor(Math.random() * names.length);
        unique.add(names.splice(i, 1)[0]);
      }
    }
    return Array.from(unique);
  }

  private generateEmployees(count: number): Array<{firstName:string; lastName:string; street:string; postcode:string; city:string; phone:string}> {
    const firstNames = ['Max','Anna','Peter','Laura','Jonas','Lea','Felix','Mia','Tim','Nina','Lukas','Sarah','Paul','Emma','Noah','Sofia','Ben','Marie','Julian','Clara'];
    const lastNames  = ['Müller','Schmidt','Schneider','Fischer','Weber','Wagner','Becker','Hoffmann','Koch','Bauer','Klein','Wolf','Schröder','Neumann','Krause','Maier','Lehmann','Huber','Keller','Schultz'];
    const cities     = ['Berlin','Hamburg','München','Köln','Frankfurt','Stuttgart','Düsseldorf','Dortmund','Essen','Bremen','Leipzig','Dresden','Hannover','Nürnberg','Freiburg','Wiesbaden','Mainz','Mannheim','Aachen','Kiel'];
    const streets    = ['Musterstraße','Hauptstraße','Goethestraße','Schillerweg','Parkallee','Bergstraße','Lindenweg','Rosenweg','Marktplatz','Bahnhofstraße'];

    const employees: Array<{firstName:string; lastName:string; street:string; postcode:string; city:string; phone:string}> = [];
    for (let i = 0; i < count; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const st = `${streets[Math.floor(Math.random() * streets.length)]} ${1 + Math.floor(Math.random() * 99)}`;
      const pc = `${10000 + Math.floor(Math.random() * 89999)}`;
      const city = cities[Math.floor(Math.random() * cities.length)];
      const phone = `+49 ${20 + Math.floor(Math.random() * 79)} ${100000 + Math.floor(Math.random() * 899999)}`;
      employees.push({ firstName: fn, lastName: ln, street: st, postcode: pc, city, phone });
    }
    return employees;
  }
}
