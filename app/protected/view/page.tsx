'use client'

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Database } from "@/types/database.types"
import { Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

type Resturent = Database['public']['Tables']['resturents']['Row']

export default function ResturentsTable() {
  const [resturents, setResturents] = useState<Resturent[]>([])
  const supabase = createClient();
  const router = useRouter()

  useEffect(() => {
    const fetchResturents = async () => {
      const { data, error } = await supabase
        .from('resturents')
        .select('*')
      
      if (error) {
        console.error('Error fetching resturents:', error)
        return
      }

      setResturents(data || [])
    }

    fetchResturents()
  }, [supabase])

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('resturents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting resturent:', error)
      return
    }

    setResturents(resturents.filter(r => r.id !== id))
  }

  return (
    <div className="container mx-auto py-10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Age Restriction</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resturents.map((resturent) => (
            <TableRow key={resturent.id}>
              <TableCell>{resturent.name}</TableCell>
              <TableCell>{resturent.address}</TableCell>
              <TableCell>{resturent.website}</TableCell>
              <TableCell>{resturent.price}</TableCell>
              <TableCell>{resturent.age_restriction}</TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/protected/bar/${resturent.id}`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(resturent.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}