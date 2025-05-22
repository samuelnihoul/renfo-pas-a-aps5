import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, Calendar, FileVideo, AlignJustify, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Administration</h1>
      <p className="text-muted-foreground mb-6">
        Bienvenue dans l'interface d'administration de Renfo Pas à Pas. Gérez vos programmes, routines, exercices et blocs facilement.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Programmes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Créez et gérez les programmes d'entraînement pour les coureurs.</p>
            <div className="flex gap-2">
              <Link href="/admin/programmes">
                <Button variant="outline">Voir tous</Button>
              </Link>
              <Link href="/admin/programmes/nouveau">
                <Button>Ajouter</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Routines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Gérez les jours d'entraînement dans vos programmes.</p>
            <div className="flex gap-2">
              <Link href="/admin/routines">
                <Button variant="outline">Voir tous</Button>
              </Link>
              <Link href="/admin/routines/nouveau">
                <Button>Ajouter</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              Exercices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Ajoutez et modifiez les exercices de renforcement musculaire.</p>
            <div className="flex gap-2">
              <Link href="/admin/exercices">
                <Button variant="outline">Voir tous</Button>
              </Link>
              <Link href="/admin/exercices/nouveau">
                <Button>Ajouter</Button>
              </Link>
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlignJustify className="w-5 h-5" />
              Blocks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Ajoutez et modifiez les blocs de renforcement musculaire.</p>
            <div className="flex gap-2">
              <Link href="/admin/blocs">
                <Button variant="outline">Voir tous</Button>
              </Link>
              <Link href="/admin/blocs/nouveau">
                <Button>Ajouter</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
