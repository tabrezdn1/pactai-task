import { ResourceWrapper, ProcessingState, FHIRVersion } from "@/types/resource";
import { faker } from "@faker-js/faker";

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Mock API endpoint constant kept for potential real API use
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Realistic healthcare descriptions and AI summaries
const healthcareDescriptions = [
  "Blood pressure reading: 120/80 mmHg, heart rate 72 bpm, normal sinus rhythm",
  "Prescribed Metformin 500mg twice daily for Type 2 diabetes management",
  "Patient reports penicillin allergy with previous anaphylactic reaction",
  "Complete blood count shows normal white cell count, hemoglobin 13.5 g/dL",
  "Chest X-ray reveals clear lungs, no acute cardiopulmonary process",
  "Annual wellness visit: BMI 24.2, all vital signs within normal limits",
  "Flu vaccination administered, patient tolerated well, no adverse reactions",
  "MRI brain shows no acute abnormalities, follow-up in 6 months recommended",
  "Colonoscopy completed, 2 small polyps removed and sent for pathology",
  "Patient counseled on smoking cessation, nicotine replacement therapy initiated"
];

const aiSummaries = [
  "Normal vital signs indicate stable cardiovascular health",
  "Medication therapy appropriately managed with good patient compliance",
  "Critical allergy information documented for safe care coordination",
  "Laboratory values within expected range for patient demographics",
  "Imaging results support continued conservative management approach",
  "Preventive care measures completed per clinical guidelines",
  "Vaccination status updated, patient protected against seasonal influenza",
  "Follow-up imaging recommended to monitor previous findings",
  "Routine screening completed with appropriate therapeutic intervention",
  "Patient education provided with evidence-based treatment plan"
];

class ApiService {
  private async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      throw {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: error instanceof Error && 'status' in error ? (error as Error & { status: number }).status : 500,
      } as ApiError;
    }
  }

  /**
   * Fetch mock ResourceWrapper data from the local Next.js API route.
   * Falls back to client-side generation if the request fails (e.g., during
   * Storybook or unit tests where the route handler isn’t available).
   */
  async getResourceWrappers(
    count: number = 1_000_000,
    onProgress?: (percent: number) => void
  ): Promise<ApiResponse<ResourceWrapper[]>> {
    // For smaller datasets (< 100k), try the mocked API route first; large ones are
    // generated locally so we can display real-time progress.
    if (count < 100_000) {
      try {
        const res = await fetch(`/api/resources?count=${count}`);
        if (res.ok) {
          const data: ResourceWrapper[] = await res.json();
          if (onProgress) onProgress(100);
          return { data, status: res.status };
        }
        // If the response isn’t OK, fall through to local generation
        console.warn('Mock API responded with non-OK status, generating locally');
      } catch (err) {
        console.warn('Mock API not available, generating locally:', err);
      }
    }

    // Fallback: generate synthetic EHR data using faker and report progress
    const resourceWrappers: ResourceWrapper[] = [];
    const progressInterval = Math.max(1, Math.floor(count / 100)); // ~1% steps

    for (let i = 0; i < count; i++) {
      const resourceType = this.getRandomResourceType();
      const state = this.getRandomProcessingState();
      const maxPatientId = Math.max(100_000, Math.floor(count / 2));

      resourceWrappers.push({
        resource: {
          metadata: {
            state,
            createdTime: faker.date.recent({ days: 30 }).toISOString(),
            fetchTime: faker.date.recent({ days: 7 }).toISOString(),
            processedTime:
              state === ProcessingState.PROCESSING_STATE_COMPLETED
                ? faker.date.recent({ days: 3 }).toISOString()
                : undefined,
            identifier: {
              key: faker.string.uuid(),
              uid: faker.string.alphanumeric(12),
              patientId: `patient-${faker.number.int({ min: 1, max: maxPatientId })}`,
            },
            resourceType,
            version: this.getRandomFHIRVersion(),
          },
          humanReadableStr: faker.helpers.arrayElement(healthcareDescriptions),
          aiSummary: faker.helpers.maybe(() => faker.helpers.arrayElement(aiSummaries), { probability: 0.6 }),
        },
      });

      if (onProgress && i % progressInterval === 0) {
        onProgress(Math.round((i / count) * 100));
        // Yield to the event loop so React can paint progress updates
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    if (onProgress) onProgress(100);

    return {
      data: resourceWrappers,
      status: 200,
      message: `Generated ${count.toLocaleString()} mock resources (local fallback)`,
    };
  }

  // Method to post new resource data (for future use)
  async createResourceWrapper(resource: ResourceWrapper): Promise<ApiResponse<ResourceWrapper>> {
    return this.fetchWithErrorHandling<ResourceWrapper>(`${API_BASE_URL}/posts`, {
      method: 'POST',
      body: JSON.stringify(resource),
    });
  }

  // Helper methods for generating mock data
  private getRandomProcessingState(): ProcessingState {
    const states = [
      ProcessingState.PROCESSING_STATE_COMPLETED,
      ProcessingState.PROCESSING_STATE_PROCESSING, 
      ProcessingState.PROCESSING_STATE_FAILED,
      ProcessingState.PROCESSING_STATE_NOT_STARTED,
    ];
    return states[Math.floor(Math.random() * states.length)];
  }

  private getRandomResourceType(): string {
    const types = [
      "Observation",
      "MedicationRequest", 
      "AllergyIntolerance",
      "DiagnosticReport",
      "Condition",
      "Patient",
      "Encounter",
      "Procedure",
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomFHIRVersion(): FHIRVersion {
    return Math.random() > 0.5 ? FHIRVersion.FHIR_VERSION_R4 : FHIRVersion.FHIR_VERSION_R4B;
  }
}

export const apiService = new ApiService(); 