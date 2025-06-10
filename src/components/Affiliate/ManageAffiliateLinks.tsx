'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '@/components/ui/alert-dialog'
import {
  Copy,
  Edit,
  // Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Settings,
  Plus
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { EditAffiliateLinkDialog } from './EditAffiliateLinkDialog'
import { CreateAffiliateLinkDialog } from './CreateAffiliateLinkDialog'

interface AffiliateLink {
  id: number
  affiliateCode: string
  promotionCode?: string | null
  utmParams?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  } | null
  targetLink?: string | null
  status: 'active' | 'disabled'
  event?: any
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ApiResponse {
  success: boolean
  data: AffiliateLink[]
  pagination: PaginationInfo
  error?: string
}

export function ManageAffiliateLinks() {
  const { toast } = useToast()
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  // const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Fetch affiliate links
  const fetchLinks = async (page = 1, status = statusFilter) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (status !== 'all') {
        params.append('status', status)
      }

      const response = await fetch(`/api/affiliate/link?${params.toString()}`)
      const result: ApiResponse = await response.json()

      if (result.success) {
        setLinks(result.data)
        setPagination(result.pagination)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch affiliate links',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching links:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch affiliate links',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete affiliate link
  // const deleteLink = async (id: number) => {
  //   try {
  //     setDeleteLoading(id)
  //     const response = await fetch(`/api/affiliate/link/${id}`, {
  //       method: 'DELETE',
  //     })

  //     const result = await response.json()

  //     if (result.success) {
  //       toast({
  //         title: 'Success',
  //         description: 'Affiliate link deleted successfully',
  //       })
  //       // Refresh the list
  //       fetchLinks(pagination.page)
  //     } else {
  //       toast({
  //         title: 'Error',
  //         description: result.error || 'Failed to delete affiliate link',
  //         variant: 'destructive',
  //       })
  //     }
  //   } catch (error) {
  //     console.error('Error deleting link:', error)
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to delete affiliate link',
  //       variant: 'destructive',
  //     })
  //   } finally {
  //     setDeleteLoading(null)
  //   }
  // }

  // Toggle status
  const toggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active'
      const response = await fetch(`/api/affiliate/link/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: `Affiliate link ${newStatus === 'active' ? 'activated' : 'disabled'} successfully`,
        })
        // Update the local state
        setLinks(links.map(link => 
          link.id === id ? { ...link, status: newStatus as 'active' | 'disabled' } : link
        ))
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update affiliate link status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update affiliate link status',
        variant: 'destructive',
      })
    }
  }

  // Copy to clipboard
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: 'Copied to Clipboard',
      description: 'Affiliate link has been copied to your clipboard.',
    })
  }

  // Filter links based on search term
  const filteredLinks = links.filter(link =>
    link.affiliateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (link.promotionCode && link.promotionCode.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  useEffect(() => {
    fetchLinks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePageChange = (newPage: number) => {
    fetchLinks(newPage)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    fetchLinks(1, status)
  }

  const handleEditLink = (link: AffiliateLink) => {
    setEditingLink(link)
    setEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    fetchLinks(pagination.page)
  }

  const handleCreateSuccess = () => {
    fetchLinks(1) // Go to first page to see the new link
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manage Affiliate Links
              </CardTitle>
              <CardDescription>
                View, edit, and manage your affiliate links
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} variant={'secondary'}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by affiliate code or promotion code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>UTM Campaign</TableHead>
                  <TableHead>Promotion Code</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading affiliate links...
                    </TableCell>
                  </TableRow>
                ) : filteredLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No affiliate links found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">
                        {link.affiliateCode}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={link.status === 'active' ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => toggleStatus(link.id, link.status)}
                        >
                          {link.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {link.utmParams?.campaign || '-'}
                      </TableCell>
                      <TableCell>
                        {link.promotionCode || '-'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(link.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {link.targetLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(link.targetLink!)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          {link.targetLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(link.targetLink as string, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLink(link)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deleteLoading === link.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Affiliate Link</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the affiliate link {`"${link.affiliateCode}"`}? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteLink(link.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalDocs)} of{' '}
                {pagination.totalDocs} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateAffiliateLinkDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Dialog */}
      <EditAffiliateLinkDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        link={editingLink}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
