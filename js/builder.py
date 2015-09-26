import shutil
import os

builddir = 'pipe_subfiles'

with open("testbuild.js", 'wb') as outfile:
    for filename in os.listdir(builddir):
        with open(builddir+"/"+filename, 'rb') as readfile:
            shutil.copyfileobj(readfile, outfile)