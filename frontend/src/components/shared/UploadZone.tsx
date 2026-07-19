import { useState, useCallback, useEffect } from "react";
import { UploadCloud, File, X, CheckCircle2, FileText, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
}

interface FileWithStatus extends File {
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

export function UploadZone({ onUpload, accept = ".pdf,.docx", maxFiles = 10 }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);

  const processFiles = (newFiles: File[]) => {
    const filesWithStatus: FileWithStatus[] = newFiles.map(file => {
      const f = file as FileWithStatus;
      f.status = 'uploading';
      f.progress = 0;
      return f;
    });

    setFiles(prev => {
      const combined = [...prev, ...filesWithStatus].slice(0, maxFiles);
      onUpload(combined);
      return combined;
    });
  };

  // Simulate upload progress
  useEffect(() => {
    const uploadIntervals = files.map((file, i) => {
      if (file.status === 'uploading') {
        return setInterval(() => {
          setFiles(prev => {
            const newFiles = [...prev];
            if (newFiles[i] && newFiles[i].progress < 100) {
              newFiles[i].progress += Math.floor(Math.random() * 20) + 10;
              if (newFiles[i].progress >= 100) {
                newFiles[i].progress = 100;
                newFiles[i].status = 'completed';
              }
            }
            return newFiles;
          });
        }, 500);
      }
      return null;
    });

    return () => uploadIntervals.forEach(interval => interval && clearInterval(interval));
  }, [files]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [files, maxFiles, onUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onUpload(newFiles);
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.pdf')) return <FileText className="w-5 h-5 text-destructive" />;
    if (filename.endsWith('.docx') || filename.endsWith('.doc')) return <FileText className="w-5 h-5 text-primary" />;
    return <File className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <div className="w-full">
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "w-full rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-16 cursor-pointer relative overflow-hidden",
          isDragging ? "border-primary bg-primary/10 shadow-[0_0_40px_rgba(37,99,235,0.2)]" : "border-white/10 hover:border-primary/50 bg-white/[0.02] hover:bg-white/[0.05]"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        )}
        <input 
          id="file-upload" 
          type="file" 
          multiple 
          accept={accept} 
          className="hidden" 
          onChange={handleFileChange}
        />
        <motion.div 
          animate={isDragging ? { y: -10 } : { y: 0 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 shadow-2xl border border-white/10 relative"
        >
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-[spin_4s_linear_infinite]" />
          <UploadCloud className="w-10 h-10 text-primary" />
        </motion.div>
        <h3 className="text-2xl font-bold font-heading mb-3 text-white">Drag & Drop resumes here</h3>
        <p className="text-muted-foreground mb-8 text-center max-w-sm">We automatically parse the data, extract skills, and rank against the active job description.</p>
        <p className="text-xs text-primary font-medium bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
          Supported formats: {accept}
        </p>
      </motion.div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 space-y-3"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-white">Upload Queue ({files.length}/{maxFiles})</h4>
              {files.some(f => f.status === 'uploading') && (
                <span className="text-xs text-primary animate-pulse">Processing files...</span>
              )}
            </div>
            
            {files.map((file, i) => (
              <motion.div 
                key={`${file.name}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl glass-panel group relative overflow-hidden border border-white/5"
              >
                {/* Progress Bar Background */}
                {file.status === 'uploading' && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-primary/10 transition-all duration-300 -z-10"
                    style={{ width: `${file.progress}%` }}
                  />
                )}
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                    {getFileIcon(file.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white line-clamp-1">{file.name}</p>
                    <div className="flex items-center mt-1 space-x-2">
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      {file.status === 'uploading' && (
                        <>
                          <span className="text-muted-foreground text-[10px]">•</span>
                          <span className="text-[10px] text-primary">{file.progress}%</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {file.status === 'completed' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </motion.div>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
