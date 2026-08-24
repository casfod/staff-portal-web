import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, CheckCircle, XCircle, Loader2, FileDown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import toast from 'react-hot-toast';

const FileDownload: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string>('file');
  const [fileSize, setFileSize] = useState<string>('');

  useEffect(() => {
    if (!fileId) {
      setStatus('error');
      return;
    }

    const downloadFile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/v1/files/${fileId}/download`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });

        if (!response.ok) {
          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }

        // Get filename from Content-Disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            setFileName(match[1].replace(/['"]/g, ''));
          }
        }

        // Get file size
        const contentLength = response.headers.get('Content-Length');
        if (contentLength) {
          const size = parseInt(contentLength);
          setFileSize(size > 1024 * 1024 
            ? `${(size / (1024 * 1024)).toFixed(2)} MB`
            : `${(size / 1024).toFixed(2)} KB`
          );
        }

        // Read the response as a blob with progress
        const reader = response.body?.getReader();
        const contentLengthNum = parseInt(response.headers.get('Content-Length') || '0');
        const chunks: BlobPart[] = []; // Changed from Uint8Array[] to BlobPart[]
        let receivedLength = 0;

        if (reader && contentLengthNum > 0) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value); // value is Uint8Array, which is a valid BlobPart
            receivedLength += value.length;
            const progressPercent = Math.round((receivedLength / contentLengthNum) * 100);
            setProgress(progressPercent);
          }
        } else {
          // Fallback for when we can't track progress
          const blob = await response.blob();
          chunks.push(blob);
          setProgress(100);
        }

        // Combine chunks into a single blob
        const blob = new Blob(chunks, { 
          type: response.headers.get('Content-Type') || undefined 
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setStatus('success');
        toast.success(`Downloaded: ${fileName}`);
        
        // Auto redirect after 3 seconds on success
        setTimeout(() => {
          navigate(-1);
        }, 3000);
        
      } catch (error) {
        console.error('Download error:', error);
        setStatus('error');
        toast.error(error instanceof Error ? error.message : 'Failed to download file');
      }
    };

    downloadFile();
  }, [fileId, navigate, fileName]); // Removed fileName from dependencies to avoid issues

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    setStatus('loading');
    setProgress(0);
    window.location.reload();
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/20 px-6">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-[0.03]"
      />
      
      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        {/* Icon based on status */}
        <div className="mb-8">
          {status === 'loading' && (
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
                <FileDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}
          {status === 'success' && (
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-in fade-in zoom-in duration-500">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-green-200 flex items-center justify-center">
                <Download className="h-4 w-4 text-green-600" />
              </div>
            </div>
          )}
          {status === 'error' && (
            <div className="relative animate-in fade-in zoom-in duration-500">
              <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border-2 border-red-200 flex items-center justify-center">
                <FileDown className="h-4 w-4 text-red-600" />
              </div>
            </div>
          )}
        </div>

        {/* Status text */}
        {status === 'loading' && (
          <>
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Preparing your download
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {fileName !== 'file' ? `Downloading ${fileName}` : 'Please wait...'}
            </p>
            {fileSize && (
              <p className="text-xs text-muted-foreground mt-1">
                File size: {fileSize}
              </p>
            )}
            <div className="w-full mt-6">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {progress < 100 ? `${progress}% downloaded` : 'Processing...'}
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="font-heading text-2xl font-semibold text-green-600 animate-in fade-in slide-in-from-bottom-2 duration-500">
              Download Complete!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              {fileName} has been downloaded successfully
            </p>
            <p className="text-xs text-muted-foreground mt-1 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              Redirecting back...
            </p>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="font-heading text-2xl font-semibold text-red-600 animate-in fade-in slide-in-from-bottom-2 duration-500">
              Download Failed
            </h2>
            <p className="mt-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
              We couldn't complete your download. Please try again.
            </p>
            <div className="flex gap-3 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
              <Button onClick={handleRetry}>
                <Download className="mr-2 h-4 w-4" />
                Retry Download
              </Button>
              <Button onClick={handleGoBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </>
        )}

        {/* Status indicator dots */}
        <div className="mt-8 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full transition-colors ${
            status === 'loading' ? 'bg-primary animate-pulse' : 'bg-muted'
          }`} />
          <span className={`h-2 w-2 rounded-full transition-colors ${
            status === 'success' ? 'bg-green-500' : 'bg-muted'
          }`} />
          <span className={`h-2 w-2 rounded-full transition-colors ${
            status === 'error' ? 'bg-red-500' : 'bg-muted'
          }`} />
        </div>
      </div>
    </div>
  );
};

export default FileDownload;