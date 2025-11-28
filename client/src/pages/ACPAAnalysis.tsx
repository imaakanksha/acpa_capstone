import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ACPAAnalysis() {
  const [region, setRegion] = useState("");
  const [policyType, setPolicyType] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [focusInput, setFocusInput] = useState("");

  const analyzeMutation = trpc.acpa.analyzePolicy.useMutation({
    onSuccess: (data) => {
      toast.success("Analysis completed successfully!");
      console.log("Analysis result:", data);
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  const handleAddFocusArea = () => {
    if (focusInput.trim() && !focusAreas.includes(focusInput.trim())) {
      setFocusAreas([...focusAreas, focusInput.trim()]);
      setFocusInput("");
    }
  };

  const handleRemoveFocusArea = (area: string) => {
    setFocusAreas(focusAreas.filter((a) => a !== area));
  };

  const handleAnalyze = () => {
    if (!region.trim()) {
      toast.error("Please enter a region");
      return;
    }
    if (!policyType.trim()) {
      toast.error("Please enter a policy type");
      return;
    }

    analyzeMutation.mutate({
      region: region.trim(),
      policyType: policyType.trim(),
      focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Adaptive Climate Policy Analyst
          </h1>
          <p className="text-lg text-slate-600">
            Generate data-driven climate policy recommendations for your region
          </p>
        </div>

        {/* Input Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Policy Analysis Request</CardTitle>
            <CardDescription>
              Provide your region and policy focus areas for comprehensive analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Region Input */}
            <div className="space-y-2">
              <Label htmlFor="region" className="text-base font-semibold">
                Region
              </Label>
              <Input
                id="region"
                placeholder="e.g., California, European Union, India"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={analyzeMutation.isPending}
                className="text-base"
              />
            </div>

            {/* Policy Type Input */}
            <div className="space-y-2">
              <Label htmlFor="policyType" className="text-base font-semibold">
                Policy Type
              </Label>
              <Input
                id="policyType"
                placeholder="e.g., Renewable Energy, Emissions Reduction, Transportation"
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
                disabled={analyzeMutation.isPending}
                className="text-base"
              />
            </div>

            {/* Focus Areas */}
            <div className="space-y-2">
              <Label htmlFor="focusArea" className="text-base font-semibold">
                Focus Areas (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="focusArea"
                  placeholder="e.g., Job creation, Economic impact"
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddFocusArea()}
                  disabled={analyzeMutation.isPending}
                  className="text-base"
                />
                <Button
                  onClick={handleAddFocusArea}
                  disabled={analyzeMutation.isPending || !focusInput.trim()}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              {focusAreas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {focusAreas.map((area) => (
                    <div
                      key={area}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {area}
                      <button
                        onClick={() => handleRemoveFocusArea(area)}
                        className="text-blue-600 hover:text-blue-900 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending || !region.trim() || !policyType.trim()}
              className="w-full text-base py-6 bg-blue-600 hover:bg-blue-700"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Policy"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        {analyzeMutation.data && (
          <Card className="shadow-lg border-green-200 bg-green-50">
            <CardHeader className="border-b border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle className="text-green-900">Analysis Complete</CardTitle>
                  <CardDescription className="text-green-700">
                    Execution ID: {analyzeMutation.data.executionId}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Execution Time */}
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-sm text-slate-600">
                  Total Execution Time: {(analyzeMutation.data.totalExecutionTime / 1000).toFixed(2)}s
                </p>
              </div>

              {/* Ingestion Results */}
              {analyzeMutation.data.stages?.ingestion && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">Data Ingestion</h3>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <pre className="text-sm text-slate-700 overflow-auto max-h-48">
                      {JSON.stringify(analyzeMutation.data.stages.ingestion.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Analysis Results */}
              {analyzeMutation.data.stages?.analysis && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">Policy Analysis</h3>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <pre className="text-sm text-slate-700 overflow-auto max-h-48">
                      {JSON.stringify(analyzeMutation.data.stages.analysis.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Synthesis Results */}
              {analyzeMutation.data.stages?.synthesis && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">Policy Recommendations</h3>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <pre className="text-sm text-slate-700 overflow-auto max-h-48">
                      {JSON.stringify(analyzeMutation.data.stages.synthesis.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {analyzeMutation.error && (
          <Card className="shadow-lg border-red-200 bg-red-50">
            <CardHeader className="border-b border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <CardTitle className="text-red-900">Analysis Failed</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-red-700">{analyzeMutation.error.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
