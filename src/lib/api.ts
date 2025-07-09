import { ResourceWrapper, ProcessingState, FHIRVersion } from "@/types/resource";

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

interface JsonPlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

// Mock API endpoints - you can replace these with your actual API URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://jsonplaceholder.typicode.com';

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

  // For demo purposes, we'll transform JSONPlaceholder posts into ResourceWrapper format
  async getResourceWrappers(): Promise<ApiResponse<ResourceWrapper[]>> {
    try {
      // Using JSONPlaceholder as a mock API
      const response = await this.fetchWithErrorHandling<JsonPlaceholderPost[]>(`${API_BASE_URL}/posts`);
      
      // Transform the response into ResourceWrapper format
      const resourceWrappers: ResourceWrapper[] = response.data.slice(0, 10).map((post, index) => ({
        resource: {
          metadata: {
            state: this.getRandomProcessingState(),
            createdTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            fetchTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            processedTime: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString() : undefined,
            identifier: {
              key: `resource-${post.id}-${this.getRandomResourceType().toLowerCase()}`,
              uid: `uid-${post.id}-${Math.random().toString(36).substr(2, 9)}`,
              patientId: `patient-${Math.floor(Math.random() * 100) + 1}`,
            },
            resourceType: this.getRandomResourceType(),
            version: this.getRandomFHIRVersion(),
          },
          humanReadableStr: healthcareDescriptions[index % healthcareDescriptions.length],
          aiSummary: Math.random() > 0.3 ? aiSummaries[index % aiSummaries.length] : undefined,
        },
      }));

      return {
        data: resourceWrappers,
        status: response.status,
        message: 'Successfully fetched resource data',
      };
    } catch (error) {
      throw error;
    }
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