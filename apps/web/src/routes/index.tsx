import { Link } from '@tanstack/react-router';
import { BarChart3Icon, UploadIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';


export function IndexPage() {
  return (
    <div className="space-y-8">
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Air Quality Dashboard
            </h1>
            <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Monitor and visualize air quality measurements across different parameters and timeframes.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <BarChart3Icon className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>View Charts</CardTitle>
            <CardDescription>
              Visualize air quality measurements with interactive charts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Analyze time series data for parameters like CO, NOx, temperature, and humidity. Filter by date range and parameter types.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/charts">
              <Button className="w-full">
                <BarChart3Icon className="mr-2 h-4 w-4" />
                View Charts
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <UploadIcon className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Upload Data</CardTitle>
            <CardDescription>
              Upload new air quality measurement data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Import CSV files with air quality measurements. The system will process and store the data for visualization.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/upload">
              <Button className="w-full">
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload Data
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}