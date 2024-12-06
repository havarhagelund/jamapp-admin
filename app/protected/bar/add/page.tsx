'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from '@/components/ui/checkbox'

type Restaurant = Database['public']['Tables']['resturents']['Row']
type OpeningHours = {
    [key: string]: {
        open: string;
        close: string;
    };
};

export default function AddRestaurantPage() {
    const router = useRouter()
    const supabase = createClient()
    const { toast } = useToast()

    const [restaurantData, setRestaurantData] = useState<Partial<Restaurant>>({
        name: '',
        website: '',
        featured_image: '',
        logo: '',
        price: '',
        age_restriction: 0,
        is_facilitated: false,
        address: '',
        activities: [],
        servings: [],
    })
    const [lat, setLat] = useState<string>('')
    const [long, setLong] = useState<string>('')

    const [availableActivities, setAvailableActivities] = useState<string[]>([])
    const [availableServings, setAvailableServings] = useState<string[]>([])
    const [selectedActivities, setSelectedActivities] = useState<string[]>([])
    const [selectedServings, setSelectedServings] = useState<string[]>([])
    const [openingHours, setOpeningHours] = useState<OpeningHours>({
        monday: { open: '', close: '' },
        tuesday: { open: '', close: '' },
        wednesday: { open: '', close: '' },
        thursday: { open: '', close: '' },
        friday: { open: '', close: '' },
        saturday: { open: '', close: '' },
        sunday: { open: '', close: '' },
    })

    useEffect(() => {
        const fetchOptions = async () => {
            const { data: activitiesData } = await supabase.from('activities').select('name')
            const { data: servingsData } = await supabase.from('serving').select('name')

            setAvailableActivities(activitiesData ? activitiesData.map(activity => activity.name) : [])
            setAvailableServings(servingsData ? servingsData.map(serving => serving.name) : [])
        }

        fetchOptions()
    }, [supabase])

    const handleSubmit = async () => {
        const dataToSubmit = {
            ...restaurantData,
            activities: selectedActivities,
            servings: selectedServings,
            opening_hours: openingHours,
            location: `POINT(${long} ${lat})`,
        }

        console.log("dataToSubmit", dataToSubmit)

        const { error } = await supabase
            .from('resturents')
            .insert([dataToSubmit])

        if (error) {
            console.log(error)
            toast({
                variant: "destructive",
                title: "Error creating restaurant",
                description: error.message
            })
            return
        }
        
        console.log("success")
        toast({
            title: "Success",
            description: "Restaurant created successfully"
        })
        router.push('/protected/view')
    }

    return (
        <div className="container mx-auto py-8 w-[512px]">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Restaurant</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={restaurantData.name || ''}
                                onChange={e => setRestaurantData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                value={restaurantData.website || ''}
                                onChange={e => setRestaurantData(prev => ({ ...prev, website: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="featured_image">Featured Image URL</Label>
                            <Input
                                id="featured_image"
                                value={restaurantData.featured_image || ''}
                                onChange={e => setRestaurantData(prev => ({ ...prev, featured_image: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="logo">Logo URL</Label>
                            <Input
                                id="logo"
                                value={restaurantData.logo || ''}
                                onChange={e => setRestaurantData(prev => ({ ...prev, logo: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="price">Price Range</Label>
                            <Input
                                id="price"
                                value={restaurantData.price || ''}
                                onChange={e => setRestaurantData(prev => ({ ...prev, price: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="age_restriction">Age Restriction</Label>
                            <Input
                                id="age_restriction"
                                type="number"
                                value={restaurantData.age_restriction || ''}
                                onChange={e => setRestaurantData(prev => ({ ...prev, age_restriction: parseInt(e.target.value) }))}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={restaurantData.is_facilitated || false}
                                onCheckedChange={checked => setRestaurantData(prev => ({ ...prev, is_facilitated: checked }))}
                            />
                            <Label>Is accessible</Label>
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={restaurantData.address || ''}
                                onChange={e => setRestaurantData(prev => ({ ...prev, address: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label>Activities</Label>
                            {availableActivities.map(activity => (
                                <div key={activity} className="items-top flex space-x-2 py-1">
                                    <Checkbox
                                        id={`activity-${activity}`}
                                        checked={selectedActivities.includes(activity)}
                                        onCheckedChange={checked => {
                                            if (checked) {
                                                setSelectedActivities(prev => [...prev, activity]);
                                            } else {
                                                setSelectedActivities(prev => prev.filter(a => a !== activity));
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`activity-${activity}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {activity}
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div>
                            <Label>Servings</Label>
                            {availableServings.map(serving => (
                                <div key={serving} className="items-top flex space-x-2 py-1">
                                    <Checkbox
                                        id={`serving-${serving}`}
                                        checked={selectedServings.includes(serving)}
                                        onCheckedChange={checked => {
                                            if (checked) {
                                                setSelectedServings(prev => [...prev, serving]);
                                            } else {
                                                setSelectedServings(prev => prev.filter(s => s !== serving));
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`serving-${serving}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {serving}
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div>
                            <Label className="block mb-2">Opening Hours</Label>
                            {Object.entries(openingHours).map(([day, hours]) => (
                                <div key={day} className="flex items-center space-x-2 mb-2">
                                    <Label htmlFor={`${day}-open`} className="w-24">
                                        {day.charAt(0).toUpperCase() + day.slice(1)}
                                    </Label>
                                    <Input
                                        id={`${day}-open`}
                                        type="time"
                                        value={hours.open}
                                        onChange={e => setOpeningHours(prev => ({
                                            ...prev,
                                            [day]: { ...prev[day], open: e.target.value }
                                        }))}
                                        className="w-28"
                                    />
                                    <Label htmlFor={`${day}-close`} className="whitespace-nowrap">to</Label>
                                    <Input
                                        id={`${day}-close`}
                                        type="time"
                                        value={hours.close}
                                        onChange={e => setOpeningHours(prev => ({
                                            ...prev,
                                            [day]: { ...prev[day], close: e.target.value }
                                        }))}
                                        className="w-28"
                                    />
                                </div>
                            ))}
                        </div>

                        <div>
                            <Label htmlFor="lat">Latitude</Label>
                            <Input
                                id="lat"
                                type="number"
                                value={lat || ''}
                                onChange={e => setLat(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="long">Longitude</Label>
                            <Input
                                id="long"
                                type="number"
                                value={long || ''}
                                onChange={e => setLong(e.target.value)}
                            />
                        </div>

                        <Button onClick={handleSubmit}>Create Restaurant</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
