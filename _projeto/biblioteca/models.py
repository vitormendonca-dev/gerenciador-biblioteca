from django.db import models

class Musica(models.Model):
    titulo = models.CharField(max_length=255)
    artista = models.CharField(max_length=255)
    capa = models.URLField(blank=True, null=True)
    preview = models.URLField(max_length=500, blank=True, null=True)
    link = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.titulo