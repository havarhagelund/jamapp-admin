'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Database } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from '@/components/ui/checkbox'


type Restaurant = Database['public']['Tables']['resturents']['Row']

// Define a type for opening hours
type OpeningHours = {
    [key: string]: {
        open: string;
        close: string;
    };
};

const formatOpeningHours = (openingHours: any) => {
    if (!openingHours) return 'N/A';
    return Object.entries(openingHours as OpeningHours).map(([day, hours]) => {
        return `${day.charAt(0).toUpperCase() + day.slice(1)} ${hours.open}-${hours.close}`;
    }).join('\n');
};

type EditedData = Partial<Restaurant> & { lat?: string; long?: string };

export default function RestaurantPage() {
    const params = useParams()

    const supabase = createClient()
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editedData, setEditedData] = useState<EditedData>({ lat: '', long: '' })
    const { toast } = useToast()
    const [availableActivities, setAvailableActivities] = useState<string[]>([])
    const [availableServings, setAvailableServings] = useState<string[]>([])
    const [selectedActivities, setSelectedActivities] = useState<string[]>([])
    const [selectedServings, setSelectedServings] = useState<string[]>([])
    const [editedOpeningHours, setEditedOpeningHours] = useState<OpeningHours>({});


    useEffect(() => {
        const fetchRestaurant = async () => {
            const { data, error } = await supabase
                .from('resturents')
                .select('*')
                .eq('id', params.id)

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Error fetching restaurant",
                    description: error.message
                })
                return
            }

            setRestaurant(data[0] || [])
            setEditedData(data[0])
            setSelectedActivities(data[0]?.activities || [])
            setSelectedServings(data[0]?.servings || [])

        }

        fetchRestaurant()
    }, [params.id, supabase])

    useEffect(() => {
        const fetchOptions = async () => {
            const { data: activitiesData } = await supabase.from('activities').select('name')
            const { data: servingsData } = await supabase.from('serving').select('name')

            setAvailableActivities(activitiesData ? activitiesData.map(activity => activity.name) : [])
            setAvailableServings(servingsData ? servingsData.map(serving => serving.name) : [])
        }

        fetchOptions()
    }, [supabase])

    useEffect(() => {
        if (restaurant) {
            setEditedOpeningHours(restaurant.opening_hours as OpeningHours || {});
        }
    }, [restaurant]);

    console.log(editedData.long, editedData.lat)

    const handleSave = async () => {
        const updatedData = {
            ...editedData,
            activities: selectedActivities,
            servings: selectedServings,
            opening_hours: editedOpeningHours,

        };

        const { error } = await supabase
            .from('resturents')
            .update(updatedData)
            .eq('id', params.id)

        if (error) {
            console.log(error)
            toast({
                variant: "destructive",
                title: "Error updating restaurant",
                description: error.message
            })
            return
        }

        setRestaurant(prev => ({ ...prev!, ...updatedData } as Restaurant))
        setIsEditing(false)
        toast({
            title: "Success",
            description: "Restaurant details updated successfully"
        })
    }

    if (!restaurant) return <div>Loading...</div>

    return (
        <div className="container mx-auto py-8 w-[512px]">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                        <Button onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Cancel' : 'Edit'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={editedData.name || ''}
                                    onChange={e => setEditedData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={editedData.website || ''}
                                    onChange={e => setEditedData(prev => ({ ...prev, website: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="featured_image">Featured Image URL</Label>
                                <Input
                                    id="featured_image"
                                    value={editedData.featured_image || ''}
                                    onChange={e => setEditedData(prev => ({ ...prev, featured_image: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="logo">Logo URL</Label>
                                <Input
                                    id="logo"
                                    value={editedData.logo || ''}
                                    onChange={e => setEditedData(prev => ({ ...prev, logo: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="price">Price Range</Label>
                                <Input
                                    id="price"
                                    value={editedData.price || ''}
                                    onChange={e => setEditedData(prev => ({ ...prev, price: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="age_restriction">Age Restriction</Label>
                                <Input
                                    id="age_restriction"
                                    type="number"
                                    value={editedData.age_restriction || ''}
                                    onChange={e => setEditedData(prev => ({ ...prev, age_restriction: parseInt(e.target.value) }))}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={editedData.is_facilitated || false}
                                    onCheckedChange={checked => setEditedData(prev => ({ ...prev, is_facilitated: checked }))}
                                />
                                <Label>Is accessible</Label>
                            </div>

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={editedData.address || ''}
                                    onChange={e => setEditedData(prev => ({ ...prev, address: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label>Activities</Label>
                                {availableActivities.map(activity => (
                                    <div key={activity} className="items-top flex space-x-2 py-1">
                                        <Checkbox
                                            id="activities-check"
                                            checked={selectedActivities.includes(activity)}
                                            onCheckedChange={checked => {
                                                if (checked) {
                                                    setSelectedActivities(prev => [...prev, activity]);
                                                } else {
                                                    setSelectedActivities(prev => prev.filter(a => a !== activity));
                                                }
                                            }} />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor="activities-check"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {activity}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <Label>Servings</Label>
                                {availableServings.map(serving => (
                                    <div key={serving} className="items-top flex space-x-2 py-1">
                                        <Checkbox
                                            id={`serving-check-${serving}`}
                                            checked={selectedServings.includes(serving)}
                                            onCheckedChange={checked => {
                                                if (checked) {
                                                    setSelectedServings(prev => [...prev, serving]);
                                                } else {
                                                    setSelectedServings(prev => prev.filter(s => s !== serving));
                                                }
                                            }} />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor={`serving-check-${serving}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {serving}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <Label className="block mb-2">Opening Hours</Label>
                                {Object.keys(editedOpeningHours).map(day => (
                                    <div key={day} className="flex items-center space-x-2 mb-2">
                                        <Label htmlFor={`${day}-open`} className="w-24">{day.charAt(0).toUpperCase() + day.slice(1)}</Label>
                                        <Input
                                            id={`${day}-open`}
                                            type="time"
                                            value={editedOpeningHours[day]?.open || ''}
                                            onChange={e => setEditedOpeningHours(prev => ({
                                                ...prev,
                                                [day]: { ...prev[day], open: e.target.value }
                                            }))}
                                            className="w-28"
                                        />
                                        <Label htmlFor={`${day}-close`} className="whitespace-nowrap">to</Label>
                                        <Input
                                            id={`${day}-close`}
                                            type="time"
                                            value={editedOpeningHours[day]?.close || ''}
                                            onChange={e => setEditedOpeningHours(prev => ({
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
                                    value={editedData.lat || ''}
                                    onChange={e => setEditedData(prev => ({ ...prev, lat: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label htmlFor="long">Longitude</Label>
                                <Input
                                    id="long"
                                    type="number"
                                    value={editedData.long || ''}
                                    onChange={e => setEditedData(prev => ({ ...prev, long: e.target.value }))}
                                />
                            </div>

                            <Button onClick={handleSave}>Save Changes</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <img
                                src={restaurant.featured_image || '/placeholder.jpg'}
                                alt={restaurant.name || 'Restaurant'}
                                className="w-full h-64 object-cover rounded-lg"
                            />

                            <div className="flex items-center space-x-4">
                                <img
                                    src={restaurant.logo || '/placeholder-logo.jpg'}
                                    alt="Logo"
                                    className="w-16 h-16 rounded-full"
                                />
                                <div>
                                    <p className="text-lg">Price Range: {restaurant.price}</p>
                                    <p>Age Restriction: {restaurant.age_restriction}+</p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">Details</h2>
                                <p>Website: <a href={restaurant.website || '#'} className="text-blue-500">{restaurant.website || 'N/A'}</a></p>
                                <p>Facilitated: {restaurant.is_facilitated ? 'Yes' : 'No'}</p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">Address</h2>
                                <p>{restaurant.address || 'N/A'}</p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">Activities</h2>
                                <p>{restaurant.activities ? restaurant.activities.join(', ') : 'N/A'}</p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">Servings</h2>
                                <p>{restaurant.servings ? restaurant.servings.join(', ') : 'N/A'}</p>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">Opening Hours</h2>
                                <pre>{formatOpeningHours(restaurant.opening_hours)}</pre>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
