# Add year table to database

import pandas as pd
import sqlite3


_DBName = '../../MillionSongSubset/lastfm_tags.db'
_TableName = u'track_year'

track_year = pd.read_table("../../MillionSongSubset/tracks_per_year.txt", \
	delimiter = '<SEP>', names = [u'Year',u'tid',u'artist_name',u'song_name'], \
	header = None, engine = 'python', encoding = 'ISO-8859-1')


#Function taken from http://yznotes.com/write-pandas-dataframe-to-sqlite/
def df2sqlite(dataframe, db_name, tbl_name):
    conn=sqlite3.connect(db_name)
    conn.text_factory = lambda x: unicode(x, "utf-8", "ignore")    
    cur = conn.cursor()                                 
 
    wildcards = ','.join(['?'] * len(dataframe.columns))    
    data = [tuple(x) for x in dataframe.values]

    cur.execute("drop table if exists %s" % tbl_name)
 
    col_str = '"' + '","'.join(dataframe.columns) + '"'
    cur.execute("create table %s (%s)" % (tbl_name, col_str))
 
    cur.executemany("insert into %s values(%s)" % (tbl_name, wildcards), data)
 
    conn.commit()
    conn.close()

df2sqlite(track_year, db_name = _DBName, tbl_name = _TableName)