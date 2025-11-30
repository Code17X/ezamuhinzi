import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
interface ImageUploadProps {
  onImageAnalyzed: (analysis: string, imageUrl: string) => void;
}
export const ImageUpload = ({
  onImageAnalyzed
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const {
        data: uploadData,
        error: uploadError
      } = await supabase.storage.from('crop-images').upload(fileName, file);
      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('crop-images').getPublicUrl(uploadData.path);

      // Analyze image
      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-crop', {
        body: {
          imageUrl: publicUrl
        }
      });
      if (error) throw error;
      onImageAnalyzed(data.analysis, publicUrl);
      setPreview(null);
      toast({
        title: "Analysis complete",
        description: "Your crop has been analyzed successfully"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive"
      });
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };
  return <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="outline" className="flex-1">
          <Upload className="w-4 h-4 mr-2" />
          Upload Photo
        </Button>
        
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {preview && <div className="relative">
          <img src={preview} alt="Preview" className="w-full rounded-lg" />
          {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                <p>Analyzing...</p>
              </div>
            </div>}
        </div>}
    </div>;
};