'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface AddCompetitorDialogProps {
  open: boolean
  loading: boolean
  domain: string
  instagram: string
  facebook: string
  linkedin: string
  onOpenChange: (open: boolean) => void
  onChange: (field: string, value: string) => void
  onAdd: () => void
}

export default function AddCompetitorDialog({
  open,
  loading,
  domain,
  instagram,
  facebook,
  linkedin,
  onOpenChange,
  onChange,
  onAdd
}: AddCompetitorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Competitor</DialogTitle>
          <DialogDescription>
            Enter competitor details to track and analyze
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Competitor Domain *</Label>
            <Input 
              placeholder="competitor.com"
              value={domain}
              onChange={(e) => onChange('domain', e.target.value)}
            />
          </div>
          <div>
            <Label>Instagram Handle (Optional)</Label>
            <Input 
              placeholder="@competitor"
              value={instagram}
              onChange={(e) => onChange('instagram', e.target.value)}
            />
          </div>
          <div>
            <Label>Facebook Page (Optional)</Label>
            <Input 
              placeholder="@competitor"
              value={facebook}
              onChange={(e) => onChange('facebook', e.target.value)}
            />
          </div>
          <div>
            <Label>LinkedIn Company (Optional)</Label>
            <Input 
              placeholder="company/competitor"
              value={linkedin}
              onChange={(e) => onChange('linkedin', e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={onAdd}
            disabled={loading || !domain}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Competitor'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
