// API base URL
const API_BASE_URL = '/api';

// Parameter type definitions
export type Parameter = {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  unit: string;
  min_safe_value: number | null;
  max_safe_value: number | null;
};

// Time series data types
export type ParameterTimeSeriesData = {
  parameter: {
    id: number;
    name: string;
    display_name: string;
    unit: string;
    min_safe_value: number | null;
    max_safe_value: number | null;
  };
  series: {
    timestamp: string;
    value: number;
  }[];
};

export type TimeSeriesData = {
  from: Date;
  to: Date;
  groupBy: string;
  parameters: ParameterTimeSeriesData[];
  environmentalData: {
    temperature: {
      series: { timestamp: string; value: number }[];
    };
    relativeHumidity: {
      series: { timestamp: string; value: number }[];
    };
    absoluteHumidity: {
      series: { timestamp: string; value: number }[];
    };
  };
};

// Define types for S3 upload responses
export type S3UploadData = {
  key: string;
  location: string;
  etag: string;
};

export type S3UploadResponse = {
  success: boolean;
  message: string;
  data?: S3UploadData;
};

export type S3FileInfo = {
  key: string;
  size: number;
  lastModified: string;
};

export type S3FilesResponse = {
  success: boolean;
  files?: S3FileInfo[];
  message?: string;
};

// Function to handle API errors
function handleApiError(response: Response) {
  if (!response.ok) {
    console.error(`API error: ${response.status} ${response.statusText}`);
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// Get all parameters
export async function fetchParameters(): Promise<Parameter[]> {
  console.log('Fetching parameters from:', `${API_BASE_URL}/parameters`);
  try {
    const response = await fetch(`${API_BASE_URL}/parameters`);
    console.log('Parameters response status:', response.status);
    const data = await handleApiError(response);
    console.log('Parameters data:', data);
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching parameters:', error);
    throw error;
  }
}

// Get time series data
export async function fetchTimeSeriesData(
  from: Date,
  to: Date,
  groupBy: string,
  limit?: number
): Promise<TimeSeriesData> {
  // Format dates for API
  const fromStr = from.toISOString();
  const toStr = to.toISOString();
  
  // Construct URL with query parameters - using string concatenation for better compatibility
  const queryParams = new URLSearchParams();
  queryParams.append('from', fromStr);
  queryParams.append('to', toStr);
  queryParams.append('groupBy', groupBy);
  if (limit) queryParams.append('limit', limit.toString());
  
  const urlString = `${API_BASE_URL}/time-series?${queryParams.toString()}`;
  console.log('Fetching time series data from:', urlString);
  
  try {
    const response = await fetch(urlString);
    console.log('Time series response status:', response.status);
    const data = await handleApiError(response);
    console.log('Time series data received:', data);
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching time series data:', error);
    throw error;
  }
}

// Upload CSV file
export async function uploadCsvFile(file: File): Promise<S3UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('Uploading CSV file to:', `${API_BASE_URL}/upload/csv`);
  try {
    const response = await fetch(`${API_BASE_URL}/upload/csv`, {
      method: 'POST',
      body: formData,
    });
    
    console.log('Upload response status:', response.status);
    const data = await handleApiError(response);
    console.log('Upload data:', data);
    return {
      success: data.success,
      message: data.message,
      data: data.data
    };
  } catch (error) {
    console.error('Error uploading CSV file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Get list of uploaded files
export async function getUploadedFiles(): Promise<S3FilesResponse> {
  console.log('Fetching uploaded files from:', `${API_BASE_URL}/upload/files`);
  try {
    const response = await fetch(`${API_BASE_URL}/upload/files`);
    console.log('Files response status:', response.status);
    const data = await handleApiError(response);
    console.log('Files data:', data);
    return {
      success: data.success,
      files: data.files
    };
  } catch (error) {
    console.error('Error fetching uploaded files:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}