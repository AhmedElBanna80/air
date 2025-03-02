import { InfoIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import UploadForm from '../components/upload/upload-form';



export function UploadPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-muted-foreground mt-2">
          Import air quality measurements for visualization and analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UploadForm />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5" />
                CSV Format Guidelines
              </CardTitle>
              <CardDescription>
                Requirements for successful data import
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Expected Columns</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li><code>timestamp</code> - Date and time of the measurement</li>
                  <li><code>co_gt</code> - Carbon Monoxide ground truth</li>
                  <li><code>co_s1</code> - CO sensor reading</li>
                  <li><code>nmhc_gt</code> - Non-Methanic Hydrocarbons ground truth</li>
                  <li><code>nmhc_s2</code> - NMHC sensor reading</li>
                  <li><code>benzene_gt</code> - Benzene ground truth</li>
                  <li><code>nox_gt</code> - Nitrogen Oxides ground truth</li>
                  <li><code>nox_s3</code> - NOx sensor reading</li>
                  <li><code>no2_gt</code> - Nitrogen Dioxide ground truth</li>
                  <li><code>no2_s4</code> - NO2 sensor reading</li>
                  <li><code>o3_s5</code> - Ozone sensor reading</li>
                  <li><code>temperature</code> - Temperature in °C</li>
                  <li><code>relative_humidity</code> - Relative Humidity in %</li>
                  <li><code>absolute_humidity</code> - Absolute Humidity in g/m³</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-1">Format Requirements</h4>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                  <li>CSV files only</li>
                  <li>First row must contain column headers</li>
                  <li>Timestamp format: YYYY-MM-DD HH:MM:SS</li>
                  <li>Numeric values use period (.) as decimal separator</li>
                  <li>Maximum file size: 10 MB</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-1">Sample CSV Format</h4>
                <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
                  timestamp,co_gt,co_s1,nmhc_gt,nmhc_s2,benzene_gt,...{'\n'}
                  2023-01-01 00:00:00,2.5,121.3,955.2,820.1,9.2,...{'\n'}
                  2023-01-01 01:00:00,2.1,138.5,892.1,803.5,8.7,...
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}